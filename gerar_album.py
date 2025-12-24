import os
import json
import re
from datetime import datetime

# CONFIGURAÇÃO
folder_path = './src/img/memorias' # Onde estão as fotos
output_path = './src/data.js'      # Onde vai salvar o arquivo JS
web_path = './src/img/memorias/'   # Caminho que o HTML vai ler

# Verifica se a pasta existe
if not os.path.exists(folder_path):
    print(f"ERRO: A pasta '{folder_path}' não foi encontrada.")
    exit()

# Função para formatar a data (Ex: 2023-12-25 -> Dezembro, 2023)
def format_display_date(date_str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]
        return f"{meses[date_obj.month - 1]}, {date_obj.year}"
    except:
        return "Data Especial"

# Lista arquivos
files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
memorias = []

print(f"Processando {len(files)} fotos...")

for file in files:
    # 1. Extrai a data do nome (YYYY-MM-DD)
    match = re.match(r'^(\d{4}-\d{2}-\d{2})', file)
    date = match.group(1) if match else '2023-01-01'
    
    # 2. Cria a legenda baseada no resto do nome
    # Remove a data
    raw_caption = re.sub(r'^(\d{4}-\d{2}-\d{2})', '', file)
    # Remove a extensão
    raw_caption = re.sub(r'\.(jpg|jpeg|png)$', '', raw_caption, flags=re.IGNORECASE)
    # Troca traços e underlines por espaço
    raw_caption = re.sub(r'[-_]', ' ', raw_caption).strip()
    
    caption = raw_caption if raw_caption else "Momentos inesquecíveis"
    
    memorias.append({
        "date": date,
        "displayDate": format_display_date(date),
        "image": web_path + file,
        "caption": caption,
        "hiddenCaption": f"Eu lembro desse dia... {caption}"
    })

# Conteúdo final do arquivo JS
js_content = f"""
// ARQUIVO GERADO AUTOMATICAMENTE VIA PYTHON
const memorias = {json.dumps(memorias, indent=4, ensure_ascii=False)};
"""

# Salva o arquivo com encoding UTF-8 (importante para acentos)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Sucesso! Arquivo '{output_path}' criado com {len(memorias)} memórias.")