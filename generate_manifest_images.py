from PIL import Image, ImageDraw, ImageFont

src = "public/manifest/icon-source.png"
logo = Image.open(src).convert("RGBA")
dark = (8,10,25,255)

# ICON 1024x1024
icon = logo.resize((1024,1024))
bg = Image.new("RGBA", icon.size, dark)
icon_final = Image.alpha_composite(bg, icon).convert("RGB")
icon_final.save("public/manifest/icon.png")

# SPLASH 200x200
splash = logo.resize((200,200))
bg = Image.new("RGBA", splash.size, dark)
splash_final = Image.alpha_composite(bg, splash).convert("RGB")
splash_final.save("public/manifest/splash.png")

# HERO + OG 1200x630
canvas = Image.new("RGBA", (1200,630), dark)
hero_logo = logo.resize((900,500))
canvas.paste(hero_logo, (150,60), hero_logo)

draw = ImageDraw.Draw(canvas)
try:
    font = ImageFont.truetype("DejaVuSans-Bold.ttf", 70)
except:
    font = ImageFont.load_default()

text = "Play. Win. Earn."
w = draw.textlength(text, font=font)
draw.text(((1200-w)/2, 520), text, font=font, fill=(235,240,255))

canvas.convert("RGB").save("public/manifest/hero.png")
canvas.convert("RGB").save("public/manifest/og.png")

print("DONE ✅")
