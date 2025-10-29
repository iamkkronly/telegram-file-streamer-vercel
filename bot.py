
import telegram
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters
import requests
import os

TOKEN = os.environ.get("TOKEN")

def start(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Send me a direct link to a file and I will download it for you.")

def download_file(update, context):
    url = update.message.text
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()

        file_name = os.path.basename(url)
        if not file_name:
            file_name = "downloaded_file"

        # Use a temporary directory for file storage
        temp_file_path = f"/tmp/{file_name}"

        with open(temp_file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

        context.bot.send_document(chat_id=update.effective_chat.id, document=open(temp_file_path, 'rb'))
        os.remove(temp_file_path)

    except requests.exceptions.RequestException as e:
        context.bot.send_message(chat_id=update.effective_chat.id, text=f"Error downloading file: {e}")
    except Exception as e:
        context.bot.send_message(chat_id=update.effective_chat.id, text=f"An unexpected error occurred: {e}")

def main():
    if not TOKEN:
        raise ValueError("No TOKEN found for Telegram bot")

    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, download_file))

    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
