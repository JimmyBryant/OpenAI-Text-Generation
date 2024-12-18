<template>
    <div class="container">
        <!-- 左侧部分 -->
        <div class="left-panel">
            <div class="field">
                <label for="apiKey">OpenAI API Key:</label>
                <input id="apiKey" type="password" v-model="apiKey" placeholder="Enter your API Key"
                    @blur="saveApiKey" />
            </div>

            <div class="field">
                <label for="model">Model:</label>
                <select id="model" v-model="model" @change="saveModel">
                    <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
                </select>
            </div>
        </div>

        <!-- 右侧部分 -->
        <div class="right-panel">
            <!-- 顶部: System Message -->
            <div class="field">
                <label for="systemMessage">System Message:</label>
                <textarea id="systemMessage" v-model="systemMessage" placeholder="Enter system message..." rows="3"
                    @blur="saveSystemMessage"></textarea>
            </div>

            <!-- 中间: 对话记录 -->
            <div class="chat-history">
                <h2>Chat History</h2>
                <div v-for="(message, index) in messages" :key="index" class="message">
                    <select v-model="message.role">
                        <option value="system">System</option>
                        <option value="user">User</option>
                        <option value="assistant">Assistant</option>
                    </select>
                    <textarea v-model="message.content" placeholder="Message content" rows="3"></textarea>
                    <button class="delete-button" @click="deleteMessage(index)">Delete</button>
                </div>
                <button class="clear-button" @click="clearMessages">Clear Chat History</button>
            </div>

            <!-- 底部: User Message -->
            <div class="user-message">
                <div class="field">
                    <textarea id="userMessage" v-model="userMessage" placeholder="Enter user message..." rows="3"
                        @blur="saveUserMessage"></textarea>
                </div>

                <button @click="sendPrompt" :disabled="loading || !apiKey">
                    {{ loading ? "Generating..." : "Send" }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

// 响应式数据
const apiKey = ref(localStorage.getItem("apiKey") || "");
const model = ref(localStorage.getItem("model") || "gpt-4o-mini");
const systemMessage = ref(localStorage.getItem("systemMessage") || "");
const userMessage = ref(localStorage.getItem("userMessage") || "");
const messages = ref(JSON.parse(localStorage.getItem("messages") || '[]') || []);
const loading = ref(false);
const models = ["gpt-4o", "gpt-4o-mini"];

// 保存数据到 localStorage
const saveApiKey = () => localStorage.setItem("apiKey", apiKey.value);
const saveModel = () => localStorage.setItem("model", model.value);
const saveSystemMessage = () => {
    localStorage.setItem("systemMessage", systemMessage.value);
    updateSystemMessage();
};
const saveUserMessage = () => localStorage.setItem("userMessage", userMessage.value);

// 更新对话记录中的 System Message
const updateSystemMessage = () => {
    const systemIndex = messages.value.findIndex((msg: { role: string, content: string }) => msg.role === "system");
    if (systemIndex !== -1) {
        messages.value[systemIndex].content = systemMessage.value;
    } else {
        messages.value.unshift({ role: "system", content: systemMessage.value });
    }
    saveMessages();
};
// 删除指定消息
const deleteMessage = (index: number) => {
  messages.value.splice(index, 1);
};
// 清空聊天记录
const clearMessages = () => {
    messages.value = [];
    localStorage.setItem("messages", JSON.stringify(messages.value));
};

// 保存聊天记录到 localStorage
const saveMessages = () => {
    localStorage.setItem("messages", JSON.stringify(messages.value));
};
// 调用 OpenAI API
const sendPrompt = async () => {
    if (!userMessage.value.trim()) {
        alert("User message cannot be empty.");
        return;
    }
    if (!apiKey.value) {
        alert("API Key is required.");
        return;
    }

    // 将当前用户输入加入到对话记录
    messages.value.push({ role: "user", content: userMessage.value });
    saveMessages();
    loading.value = true;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: model.value,
                messages: messages.value,
                max_tokens: 150,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey.value}`,
                },
            }
        );

        const assistantMessage = response.data.choices[0].message.content.trim();
        messages.value.push({ role: "assistant", content: assistantMessage });
        saveMessages();
        userMessage.value = ""; // 清空用户输入
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        alert("Failed to generate text. Please check your API Key or messages.");
    } finally {
        loading.value = false;
    }
};
</script>

<style lang="scss" scoped>
@use "sass:color";
$primary-color: #3498db;
$secondary-color: #2ecc71;
$danger-color: #e74c3c;
$font-color: #2c3e50;

.container {
    display: flex;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    min-height: 100vh;
    height: auto;
    .left-panel {
        width: 300px;
        padding: 20px;
        border-right: 1px solid #ddd;

        input,
        select {
            display: block;
            box-sizing: border-box;
            padding: .5rem;
        }
    }

    .right-panel {
        flex: 1;
        padding: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
        .chat-history {
            margin: 20px 0;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 5px;
            background-color: #f9f9f9;
            flex: 1;
            .message {
                display: flex;
                flex-direction: column;
                margin-bottom: 10px;

                select,
                textarea {
                    display: block;
                    box-sizing: border-box;
                    margin-top: 5px;
                    padding: .5rem;
                    width: 100%;
                    font-size: 0.9rem;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    resize: vertical;
                }

                select {
                    width: 120px;
                }
                .delete-button {
                    background-color: #434343;
                    font-size: 11px;
                    width: 60px;
                    color: #FFF;
                    margin: 1rem 0;
                }
            }

            .clear-button {
                margin-top: 10px;
                padding: .5rem;
                background-color: $danger-color;
                color: white;
                border: none;
                border-radius: 5px;
                font-size: .785rem;
                cursor: pointer;

                &:hover {
                    background-color: color.scale($danger-color, $lightness: -10%);
                }
            }
        }
    }
    .user-message {
        display: flex;
        width: 100%;
        gap: 2rem;
        margin-top: 100px;
        .field {
            flex: 1;
            line-height: 0;
            label {
                font-weight: bold;
            }
        }

        button {
            padding: 10px 20px;
            font-size: 1rem;
            color: #fff;
            background-color: $secondary-color;
            border: none;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background-color: color.scale($secondary-color, $lightness: -10%);
            }

            &:disabled {
                background-color: color.scale($secondary-color, $lightness: 20%);
                cursor: not-allowed;
            }
        }
    }
    .field{
        label{
            margin-bottom: 1rem;
            display: block;
        }
        input,
        select,
        textarea {
            width: 100%;
            padding: 10px;
            font-size: 1rem;
            border: 1px solid #ddd;
            border-radius: 5px;

            &:focus {
                outline: none;
                border-color: $primary-color;
            }
        }
    }
}
</style>