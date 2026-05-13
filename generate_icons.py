from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Forceer UTF-8 output voor terminal
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def create_icon(size, output_path):
    """Maak een JellyLegs app icoon met de opgegeven grootte."""
    img = Image.new('RGBA', (size, size), (39, 174, 96, 255))  # #27ae60
    draw = ImageDraw.Draw(img)
    
    # Teken een "J" letter in wit
    try:
        font_size = int(size * 0.5)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        text = "JL"
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((size//2 - tw//2, size//2 - th//2), text, fill="white", font=font)
    except:
        pass
    
    img.save(output_path, 'PNG')
    print(f"  [OK] {output_path} ({size}x{size})")

# Icoon maten die nodig zijn voor de PWA
sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512]

script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, 'icons')
os.makedirs(output_dir, exist_ok=True)

print("JellyLegs iconen genereren...")
for s in sizes:
    output = os.path.join(output_dir, f'icon-{s}x{s}.png')
    create_icon(s, output)

print("\n[VOLTOOID] Alle iconen gegenereerd in de 'icons' map!")
print("Ga naar https://www.pwabuilder.com om een APK te genereren.")
print("Upload daar de map: index.html + manifest.json + sw.js + icons/")