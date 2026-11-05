"""Генерирует голосовой счёт для последних 4 секунд (бесплатно, нужен интернет на ПК).
Запуск:  pip install edge-tts   →   python tools/make_voice.py
Файлы появятся в папке voice/ — приложение подхватит их само."""
import asyncio, pathlib, edge_tts

VOICE = "ru-RU-DmitryNeural"      # мужской; женский: ru-RU-SvetlanaNeural
OUT = pathlib.Path(__file__).resolve().parent.parent / "voice"
WORDS = {"n4": "четыре", "n3": "три", "n2": "два", "n1": "один", "stop": "стоп"}

async def main():
    OUT.mkdir(exist_ok=True)
    for name, text in WORDS.items():
        await edge_tts.Communicate(text, VOICE, rate="+10%").save(str(OUT / f"{name}.mp3"))
        print("OK", name)

asyncio.run(main())
