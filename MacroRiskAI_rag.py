import os
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFDirectoryLoader, DataFrameLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma

load_dotenv()

class RAGAgent:
    def __init__(self):
        # Project-relative paths, resolved from this file's location (repo root)
        self.base_dir = Path(__file__).resolve().parent
        self.docs_dir = self.base_dir / "DATASET"
        self.db_dir = self.base_dir / "chroma_db"

        print(f"📁 Looking for papers and data in: {self.docs_dir}")
        self.docs_dir.mkdir(exist_ok=True)
        
        self.embeddings = OpenAIEmbeddings()
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
        
        self.vector_store = Chroma(
            collection_name="macro_finance_knowledge",
            embedding_function=self.embeddings,
            persist_directory=str(self.db_dir)
        )

    def ingest_documents(self):
        print("📚 Loading PDFs...")
        pdf_loader = PyPDFDirectoryLoader(str(self.docs_dir))
        documents = pdf_loader.load()
        
        # 1. Add Excel panel dataset
        excel_path = self.docs_dir / "final_panel_dataset_repo_brent.xlsx"
        if excel_path.exists():
            print(f"📊 Loading Excel Panel from {excel_path}")
            df = pd.read_excel(excel_path)
            df['text_repr'] = df.apply(lambda row: f"Financial data: {row.to_string()}", axis=1)
            excel_loader = DataFrameLoader(df, page_content_column="text_repr")
            documents.extend(excel_loader.load())
        else:
            print(f"❌ Excel dataset not found at {excel_path}!")

        # 2. NEW: Add granular Financial Statements CSV
        csv_path = self.base_dir / "DATASET/Hackathon_7_Metrics_Growth.csv"
        if csv_path.exists():
            print(f"📊 Loading CSV Financial Statements from {csv_path}")
            df_csv = pd.read_csv(csv_path)
            # Create a rich text representation of the statements for vector search
            df_csv['text_repr'] = df_csv.apply(lambda row: f"Financial Statement Data: {row.to_string()}", axis=1)
            csv_loader = DataFrameLoader(df_csv, page_content_column="text_repr")
            documents.extend(csv_loader.load())
        else:
            print(f"❌ CSV dataset not found at {csv_path}!")

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(documents)
        
        if splits:
            print(f"✅ Ingesting {len(splits)} chunks...")
            # Batch processing to fix the max batch size error
            batch_size = 500
            for i in range(0, len(splits), batch_size):
                batch = splits[i:i + batch_size]
                self.vector_store.add_documents(batch)
                print(f"   ...processed batch {i // batch_size + 1}")
            
            print(f"🎉 Done! ChromaDB saved to {self.db_dir}")
        else:
            print("❌ No documents found to ingest.")

    def execute(self, query: str, chat_history: list = None, langgraph_context: dict = None) -> str:
        # Simple RAG retrieval
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 5})
        docs = retriever.invoke(query)
        # Format previous history into a readable transcript string
        history_str = ""
        if chat_history:
            for msg in chat_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                history_str += f"{role.capitalize()}: {content}\n"
        context = "\n".join([d.page_content for d in docs])
        if langgraph_context:
            context += f"\n\nLive Pipeline Context (Contains detailed financial statements, AI forecasts, and macro economy assumptions): {str(langgraph_context)}"
            

        prompt = f"""
    Previous Conversation:
    {history_str}

    Current User Query: {query}
    
    Answer the user query based on the retrieved financial docs and the conversation history above.
You are 'MacroRisk AI', an expert Wall Street financial assistant.
Use the following retrieved knowledge base and the 'Live Pipeline Context' to answer the user's question.

IMPORTANT INSTRUCTIONS:
1. If the user asks for financial statements (Balance Sheet, Income Statement, Cash Flow, etc.) or specific financial metrics, YOU MUST extract the complete financial data from the 'Live Pipeline Context' (specifically the 'full_financials' block or the Vector DB if missing).
2. Format the financial data beautifully in Markdown tables, mimicking the professional layout of financial websites like 'Moneycontrol'. Structure it cleanly with clear headers (e.g., Year, Revenues, Expenses, Assets, Liabilities). Group rows by category logically to make it highly readable.
3. Incorporate projected macro-economic assumptions from the pipeline if asked about future growth.
4. Be highly analytical, structured, and do not hallucinate numbers. If the data is not in the context, explicitly state that.

Context:
{context}

User Question: {query}
"""
        context = "\n".join([d.page_content for d in docs])
        if langgraph_context:
            context += f"\n\nLive Pipeline Context (Contains detailed financial statements, AI forecasts, and macro economy assumptions): {str(langgraph_context)}"
          
        return self.llm.invoke(prompt).content

if __name__ == "__main__":
    print("🚀 Starting RAG Agent...")
    agent = RAGAgent()
    agent.ingest_documents()