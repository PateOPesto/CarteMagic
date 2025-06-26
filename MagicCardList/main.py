from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json

# Initialisation de l'application Flask
app = Flask(__name__)
CORS(app)  # Autorise les requêtes cross-origin (React/Frontend)

# === Constantes ===
SELECTION_FILE = 'cartes_selectionnees.json'  # Fichier de sauvegarde des cartes cochées
EXCLUDED_SETS = {'rfin', 'tfin', 'afin', 'pss5', 'fca', 'pfin'}  # Sets à ignorer


# === Fonctions utilitaires ===

def load_selection():
    #Charge la sélection enregistrée depuis le fichier JSON.
    if os.path.exists(SELECTION_FILE):
        with open(SELECTION_FILE, 'r', encoding='utf-8') as f:
            return set(json.load(f))
    return set()


def save_selection(selection):
    #Sauvegarde la sélection dans le fichier JSON.
    with open(SELECTION_FILE, 'w', encoding='utf-8') as f:
        json.dump(sorted(selection), f, ensure_ascii=False, indent=2)


def get_related_set_codes(main_set_code):
    """
    Récupère tous les codes de sets liés au set principal,
    en incluant ses sous-ensembles (ex: commander, etc).
    """
    url = "https://api.scryfall.com/sets"
    response = requests.get(url)
    response.raise_for_status()
    sets = response.json()['data']

    return [
        s['code']
        for s in sets
        if (s['code'] == main_set_code or s.get('parent_set_code') == main_set_code)
           and s['code'] not in EXCLUDED_SETS
    ]


def get_all_cards_for_set(set_code):
    #Récupère toutes les cartes d'un set donné, même les variantes ou bonus.
    all_cards = []
    url = f"https://api.scryfall.com/cards/search?q=set:{set_code}+include:extras"

    while url:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        all_cards.extend(data['data'])
        url = data.get('next_page')  # Pagination
    return all_cards


def get_all_cards_for_extension(main_set_code):
    #Récupère toutes les cartes d’un set principal et ses sets enfants.
    all_cards = []
    for code in get_related_set_codes(main_set_code):
        all_cards.extend(get_all_cards_for_set(code))
    return all_cards


# === Routes API ===

@app.route('/api/cards')
def api_cards():
    """Renvoie la liste des cartes formatées à partir d’un set Scryfall donné."""
    set_code = "fin"  # Code du set principal à charger
    selection = load_selection()
    cards = get_all_cards_for_extension(set_code)

    results = []
    for card in cards:
        name = card.get('name', 'Sans nom')

        # Récupération de l'image (face unique ou double face)
        image_url = (
                card.get('image_uris', {}).get('normal')
                or card.get('card_faces', [{}])[0].get('image_uris', {}).get('normal')
        )

        price = float(card.get('prices', {}).get('eur') or 0)
        checked = name in selection

        # Construction de l'objet carte
        results.append({
            "name": name,
            "image_url": image_url,
            "checked": checked,
            "collector_number": card.get("collector_number", ""),
            "rarity": card.get("rarity", ""),
            "booster": card.get("booster", False),
            "price": price
        })

    return jsonify(results)


@app.route('/api/update-selection', methods=['POST'])
def update_selection():
    """Mets à jour la sélection d'une carte (ajout ou suppression)."""
    data = request.get_json()
    name = data.get("name")
    checked = data.get("checked")

    # Vérification des données reçues
    if name is None or checked is None:
        return jsonify({"error": "Requête invalide"}), 400

    # Mise à jour du fichier de sélection
    selection = load_selection()
    if checked:
        selection.add(name)
    else:
        selection.discard(name)
    save_selection(selection)

    return jsonify({"status": "ok"})


# === Point d'entrée ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
