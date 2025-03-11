import google.generativeai as genai

genai.configure(api_key="GEMINI_KEY_HERE")

# List available models
models = genai.list_models()
for model in models:
    print(model.name)
