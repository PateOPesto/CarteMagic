from flask import Flask, render_template, request, jsonify
import requests
import json
import os

app = Flask(__name__)
SELECTION_FILE = 'cartes_selectionnees.json'

EXCLUDED_SETS = {'rfin', 'tfin', 'afin', 'pss5', 'fca', 'pfin'}

# ---------- Données depuis Scryfall ----------

def get_related_set_codes(main_set_code):
    """Retourne les codes de tous les sets liés à l'extension principale."""
    response = requests.get("https://api.scryfall.com/sets")
    response.raise_for_status()
    sets = response.json()['data']
    return [
        s['code']
        for s in sets
        if (s['code'] == main_set_code or s.get('parent_set_code') == main_set_code)
        and s['code'] not in EXCLUDED_SETS
    ]

def get_all_cards_for_set(set_code):
    """Retourne toutes les cartes d'un set, avec pagination."""
    all_cards = []
    url = f"https://api.scryfall.com/cards/search?q=set:{set_code}+include:extras"
    while url:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        all_cards.extend(data['data'])
        url = data.get('next_page')
    return all_cards

def get_all_cards_for_extension(main_set_code):
    """Retourne toutes les cartes des sets liés à une extension."""
    all_cards = []
    for code in get_related_set_codes(main_set_code):
        print(f"Fetching cards from set: {code}")
        all_cards.extend(get_all_cards_for_set(code))
    return all_cards

def get_set_name(set_code):
    """Retourne le nom complet de l'extension depuis Scryfall."""
    url = f"https://api.scryfall.com/sets/{set_code}"
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.json().get("name", set_code)
    return set_code

# ---------- Sélection persistée ----------

def load_selection():
    if os.path.exists(SELECTION_FILE):
        with open(SELECTION_FILE, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    return set()

def save_selection(selection):
    with open(SELECTION_FILE, 'w', encoding='utf-8') as f:
        json.dump(sorted(selection), f, ensure_ascii=False, indent=2)

# ---------- Routes Flask ----------

@app.route('/')
def index():
    set_code = "fin"
    selection = load_selection()

    try:
        set_name = get_set_name(set_code)
        cards = get_all_cards_for_extension(set_code)
        card_infos = []
        rarity_count = {'common': 0, 'uncommon': 0, 'rare': 0, 'mythic': 0}
        rarity_selected_count = dict.fromkeys(rarity_count, 0)

        total_price_checked = 0.0
        total_price_unchecked = 0.0

        for idx, card in enumerate(cards):
            name = card.get('name', 'Sans nom')
            collector_number = card.get('collector_number', '0')
            rarity = card.get('rarity', 'unknown')
            booster = card.get('booster', False)
            price = float(card.get("prices", {}).get("eur") or 0)

            checked = name in selection
            if rarity in rarity_count:
                rarity_count[rarity] += 1
                if checked:
                    rarity_selected_count[rarity] += 1

            if checked:
                total_price_checked += price
            else:
                total_price_unchecked += price

            image_url = (
                card.get('image_uris', {}).get('normal')
                or card.get('card_faces', [{}])[0].get('image_uris', {}).get('normal')
            )

            card_infos.append({
                'id': f"card_{idx}",
                'name': name,
                'image_url': image_url,
                'collector_number': collector_number,
                'checked': checked,
                'rarity': rarity,
                'booster': booster,
                'price': price,
            })

        card_infos.sort(key=lambda c: int(c['collector_number']) if c['collector_number'].isdigit() else float('inf'))

        return render_template("index.html",
                               card_infos=card_infos,
                               set_name=set_name,
                               card_taille=len(card_infos),
                               rarity_count=rarity_count,
                               total_price_checked=total_price_checked,
                               total_price_unchecked=total_price_unchecked)

    except Exception as e:
        return f"Erreur : {e}"

@app.route('/update-selection', methods=['POST'])
def update_selection():
    data = request.get_json()
    name = data.get('name')
    checked = data.get('checked')

    if name is None or checked is None:
        return jsonify({"error": "Requête invalide"}), 400

    selection = load_selection()
    if checked:
        selection.add(name)
    else:
        selection.discard(name)

    save_selection(selection)
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(debug=True)
