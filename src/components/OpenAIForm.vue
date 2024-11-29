<template>
    <div class="container">
        <div class="left-side">
            <!-- API Key 输入框 -->
            <div class="field">
                <label for="apiKey">OpenAI API Key:</label>
                <input id="apiKey" type="password" v-model="apiKey" placeholder="Enter your API Key"
                    @blur="saveApiKey" />
            </div>

            <!-- 模型选择下拉框 -->
            <div class="field">
                <label for="model">Model:</label>
                <select id="model" v-model="model" @change="saveModel">
                    <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
                </select>
            </div>
        </div>
        <div class="main-content">

            <h1>OpenAI Text Generator</h1>
            <div class="prompt-group">
                <!-- Prompt 输入框 -->
                <textarea v-model="prompt" placeholder="Enter your prompt here..." rows="4"></textarea>
                <button @click="sendPrompt" :disabled="loading || !apiKey">
                    {{ loading ? "Generating..." : "Send" }}
                </button>
            </div>


            <!-- 显示生成结果 -->
            <div v-if="result" class="result">
                <h2>Generated Text:</h2>
                <p>{{ result }}</p>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

// 响应式数据
const prompt = ref("");
const result = ref("");
const loading = ref(false);

// 用户配置
const apiKey = ref(localStorage.getItem("apiKey") || "");
const model = ref(localStorage.getItem("model") || "gpt-4o-mini");
const models = ["gpt-4o", "gpt-4o-mini"];

// 保存用户输入到 localStorage
const saveApiKey = () => localStorage.setItem("apiKey", apiKey.value);
const saveModel = () => localStorage.setItem("model", model.value);

// 调用 OpenAI API
const sendPrompt = async () => {
    if (!prompt.value.trim()) {
        alert("Please enter a prompt.");
        return;
    }
    if (!apiKey.value) {
        alert("API Key is required.");
        return;
    }

    loading.value = true;
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: model.value,
                messages: [{ role: "user", content: prompt.value }],
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
        result.value = response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        alert("Failed to generate text. Please check your API Key or prompt.");
    } finally {
        loading.value = false;
    }
};
</script>

<style lang="scss" scoped>
$primary-color: #3498db;
$secondary-color: #2ecc71;
$font-color: #2c3e50;

.container {
    margin: 50px auto;
    text-align: center;
    font-family: Arial, sans-serif;
    color: $font-color;
    display: flex;
    gap: 2rem;

    .left-side {
        width: 300px;

        .field {

            input,
            select {
                box-sizing: border-box;
                display: block;
                width: 100%;
                padding: .5rem;
            }
        }
    }

    .main-content {
        flex: 1;
        padding: 2rem;
        .prompt-group {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            gap: 1rem;
            textarea{
                flex:1;
                padding: 1rem;
            }
        }
    }



    h1 {
        font-size: 2rem;
        margin-bottom: 1.5rem;
        color: $primary-color;
    }

    .field {
        margin-bottom: 20px;
        text-align: left;

        label {
            display: block;
            font-size: 1rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        input,
        select,
        textarea {
            width: 100%;
            padding: 10px;
            font-size: 1rem;
            margin-top: 5px;
            border: 1px solid #ddd;
            border-radius: 5px;

            &:focus {
                outline: none;
                border-color: $primary-color;
                box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
            }
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
        transition: background-color 0.3s ease;

        &:hover {
            background-color: darken($secondary-color, 10%);
        }

        &:disabled {
            background-color: lighten($secondary-color, 20%);
            cursor: not-allowed;
        }
    }

    .result {
        margin-top: 30px;
        text-align: left;

        h2 {
            font-size: 1.5rem;
            color: $primary-color;
        }

        p {
            font-size: 1rem;
            line-height: 1.5;
        }
    }
}
</style>