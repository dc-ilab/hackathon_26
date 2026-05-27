import os
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

if __name__ == "__main__":
    endpoint = os.getenv("FOUNDRY_ENDPOINT")
    deployment_name = "gpt-5.4-pro"
    api_key = os.getenv("FOUNDRY_API_KEY")

    client = AzureOpenAI(
        api_version="2025-04-01-preview",
        azure_endpoint=endpoint,
        api_key=api_key,
    )

    response = client.responses.create(
        model=deployment_name,
        input=[
            {
                "role": "user",
                "content": "What is the capital of France?",
            }
        ],
    )

    # print(response.output[1].content[0].to_dict())
    print(response)