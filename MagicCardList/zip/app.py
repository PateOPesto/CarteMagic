from flask import Flask, render_template_string, request, jsonify, render_template
import requests
import json
import os

app = Flask(__name__)

SELECTION_FILE = 'cartes_selectionnees.json'

def get_related_set_codes(main_set_code):
    url = "https://api.scryfall.com/sets"
    response = requests.get(url)
    response.raise_for_status()
    sets = response.json()['data']

    related_sets = []
    for s in sets:
        if (s['code'] == main_set_code or s.get('parent_set_code') == main_set_code) and not s['code'] in {'rfin','tfin','afin','pss5','fca','pfin'}:
            related_sets.append(s['code'])
    return related_sets

def get_all_cards_for_set(set_code):
    base_url = "https://api.scryfall.com/cards/search"
    query = f"?q=set:{set_code}"
    all_cards = []

    url = base_url + query
    while url:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        all_cards.extend(data['data'])

        if data.get('has_more'):
            url = data.get('next_page')
        else:
            url = None

    return all_cards

def get_all_cards_for_extension(main_set_code):
    all_cards = []
    related_set_codes = get_related_set_codes(main_set_code)
    for code in related_set_codes:
        print(f"Fetching cards from set: {code}")
        cards = get_all_cards_for_set(code)
        all_cards.extend(cards)
    return all_cards



def load_selection():
    if os.path.exists(SELECTION_FILE):
        with open(SELECTION_FILE, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    return set()

def save_selection(selection):
    with open(SELECTION_FILE, 'w', encoding='utf-8') as f:
        json.dump(sorted(selection), f, ensure_ascii=False, indent=2)

def get_all_cards_from_set(set_code):
    base_url = "https://api.scryfall.com/cards/search"
    query = f"?q=set:{set_code}+include:extras"
    all_cards = []

    def get_related_set_codes(main_set_code):
        url = "https://api.scryfall.com/sets"
        response = requests.get(url)
        response.raise_for_status()
        sets = response.json()['data']

        related_sets = []
        for s in sets:
            if s['code'] == main_set_code or s.get('parent_set_code') == main_set_code:
                related_sets.append(s['code'])
        return related_sets

    def get_all_cards_for_set(set_code):
        base_url = "https://api.scryfall.com/cards/search"
        query = f"?q=set:{set_code}"
        all_cards = []

        url = base_url + query
        while url:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            all_cards.extend(data['data'])

            if data.get('has_more'):
                url = data.get('next_page')
            else:
                url = None

        return all_cards

    def get_all_cards_for_extension(main_set_code):
        all_cards = []
        related_set_codes = get_related_set_codes(main_set_code)
        for code in related_set_codes:
            print(f"Fetching cards from set: {code}")
            cards = get_all_cards_for_set(code)
            all_cards.extend(cards)
        return all_cards

    url = base_url + query
    while url:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        all_cards.extend(data['data'])

        if data.get('has_more'):
            url = data.get('next_page')
        else:
            url = None

    return all_cards

def get_set_name(set_code):
    url = f"https://api.scryfall.com/sets/{set_code}"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        return data.get("name", set_code)
    else:
        return set_code

@app.route('/')
def index():

    set_code = "fin"
    selection = load_selection()

    try:
        set_name = get_set_name(set_code)
        cards = get_all_cards_from_set(set_code)
        card_taille = len(cards)

        # Préparer les cartes et stocker rareté + checked
        card_infos = []
        rarity_count = {
            'common': 0,
            'uncommon': 0,
            'rare': 0,
            'mythic': 0,
        }

        rarity_selected_count = {
            'common': 0,
            'uncommon': 0,
            'rare': 0,
            'mythic': 0,
        }

        #Compteur de prix
        total_price_checked = 0.0
        total_price_unchecked = 0.0

        for idx, card in enumerate(cards):
            name = card.get('name', 'Sans nom')
            collector_number = card.get('collector_number', '0')
            rarity = card.get('rarity', 'unknown')
            booster = card.get('booster', False)

            if 'image_uris' in card:
                image_url = card['image_uris'].get('normal')
            elif 'card_faces' in card and card['card_faces'][0].get('image_uris'):
                image_url = card['card_faces'][0]['image_uris'].get('normal')
            else:
                image_url = None

            checked = name in selection

            price = card.get("prices", {}).get("eur")  # ou 'usd' selon préférence
            price = float(price) if price else 0.0

            if checked:
                rarity_selected_count[rarity] += 1
                total_price_checked += price
            else:
                total_price_unchecked += price

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

            if rarity in rarity_count:
                rarity_count[rarity] += 1
            if checked and rarity in rarity_selected_count:
                rarity_selected_count[rarity] += 1

        card_infos.sort(key=lambda c: int(c['collector_number']) if c['collector_number'].isdigit() else float('inf'))

        # Passage au template: on envoie aussi rarity_count et rarity_selected_count

        return render_template("index.html",
                               card_infos=card_infos,
                               set_name=set_name,
                               card_taille=card_taille,
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
