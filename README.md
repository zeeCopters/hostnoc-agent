🛡️ **HostNoc-Agent**

A document-grounded AI chatbot backend with RAG, Pinecone indexing, Socket streaming, and MongoDB persistence for chats and users.

/n
🚀 **Overview**

HostNoc-Agent is a Node.js backend that allows:

✔ Uploading PDF documents

✔ Indexing them into a Pinecone vector store

✔ Storing metadata (namespace, page count) in MongoDB

✔ Real-time conversational query (RAG) via Socket.IO

✔ Context-grounded AI answers (no hallucinations)

✔ Chat history saved per user

✔ REST APIs for users and messages

🔍 **Built with:**

- Express (ESM)

- Socket.IO (real-time AI responses)

- OpenAI (LLM + embeddings)

- Pinecone (vector retrieval)

- MongoDB + Mongoose

- pnpm package manager


📦 **Features**

✅ Upload and index PDFs

✅ Extract vectors + store with Pinecone

✅ Chat with AI using RAG

✅ Grounded answers only (no external hallucination)

✅ Socket streaming responses

✅ Store/retrieve chats by user

✅ User creation (IP captured automatically)

✅ Paginated message history REST API

✅ Swagger API documentation


📋 **Quick Start**

1️⃣ Clone the repo

git clone https://github.com/teamcustombranex/hostnoc_chatbot_agent

cd hostnoc-agent

2️⃣ Install dependencies

pnpm install

3️⃣ Create .env

Copy .env.example → .env and fill in values:

PORT=3000

MONGO_URI=mongodb://localhost:27017/hostnoc-agent

PINECONE_API_KEY=your_key

PINECONE_INDEX_NAME=your_index

OPENAI_API_KEY=your_key

4️⃣ Run server
pnpm run dev


🧠 **RAG & AI Behavior**

- Uses OpenAI embeddings (text-embedding-3-small)

- Pinecone for retrieval

- Answers are grounded using a strict prompt:

- Only uses document context

- Refuses if answer not found

- No hallucination

- Configurable for production models (GPT-4o, GPT-4o-mini, etc.)


📚 **Swagger Documentation**

Available at:

http://localhost:3000/api-docs


Includes:

User API

PDF upload

Chat history API


📌 **Design Patterns**

✔ Repository pattern

✔ Clean separation (controller → service → repository)

✔ Real-time + REST

✔ Strict RAG prompt design


🛠️ **Deployment Notes**

✔ Set trust proxy if behind a proxy

✔ Persist Pinecone index

✔ Secure Socket connections

✔ Use environment configs


🧪 **Development Tips**

Enable debug logs:

DEBUG=socket.io* pnpm run dev
