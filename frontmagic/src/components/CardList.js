import React, { useState, useEffect } from "react";
import "./CardList.css";
import CollapsibleBar from "./CollapsibleBar";

/**
 * Composant principal qui affiche la liste de cartes,
 * les filtres, les compteurs et les barres de progression.
 */
function CardList() {
  // === Variables ===
  const [cards, setCards] = useState([]);
  const [, setCount] = useState(0);

  const [rarityFilter, setRarityFilter] = useState("all");
  const [checkedFilter, setCheckedFilter] = useState("all");
  const [boosterFilter, setBoosterFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name-asc");
  const [open, setOpen] = useState(false); // État pour la barre repliable

  // === Données calculées ===
  const totalCards = cards.length;
  const totalSelected = cards.filter(card => card.checked).length;

  const totalPrice = cards.reduce((sum, card) => sum + card.price, 0);
  const selectedPrice = cards
    .filter(card => card.checked)
    .reduce((sum, card) => sum + card.price, 0);

  const totalByRarity = cards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {});

  const selectedByRarity = cards.reduce((acc, card) => {
    if (card.checked) {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    }
    return acc;
  }, {});

  // === Chargement initial des cartes ===
  useEffect(() => {
    fetch("http://localhost:5000/api/cards")
      .then(res => res.json())
      .then(data => {
        setCards(data);
        setCount(data.filter(card => card.checked).length);
      });
  }, []);

  // === Mise à jour d'une carte cochée / décochée ===
  const toggleCard = (name, isChecked) => {
    fetch("http://localhost:5000/api/update-selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, checked: isChecked }),
    });

    // Mise à jour locale
    setCards(prev =>
      prev.map(card =>
        card.name === name ? { ...card, checked: isChecked } : card
      )
    );

    setCount(prev => prev + (isChecked ? 1 : -1));
  };

  // === Application des filtres et du tri ===
  const filteredAndSortedCards = cards
    .filter(card =>
      (rarityFilter === "all" || card.rarity === rarityFilter) &&
      (checkedFilter === "all" ||
        (checkedFilter === "checked" && card.checked) ||
        (checkedFilter === "unchecked" && !card.checked)) &&
      (boosterFilter === "all" ||
        (boosterFilter === "booster" && card.booster) ||
        (boosterFilter === "non-booster" && !card.booster))
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "number-asc":
          return a.collector_number - b.collector_number;
        case "number-desc":
          return b.collector_number - a.collector_number;
        default:
          return 0;
      }
    });

  // === Rendu ===
  return (
    <div className="container">
      <h2 className="title">
        Nombre de cartes : {totalSelected} / {totalCards}
      </h2>

      <div className="price-summary">
        <div>💰 Valeur possédée : {selectedPrice.toFixed(2)} €</div>
        <div>📦 Valeur totale : {totalPrice.toFixed(2)} €</div>
      </div>

      {/* Barre de progression et répartition par rareté */}
      <CollapsibleBar open={open} setOpen={setOpen} title="Progression des cartes">
        <div className="progress-bar-wrapper">
          <div
            className="progress-bar-fill"
            style={{ width: `${(totalSelected / totalCards) * 100}%` }}
          />
        </div>

        <div className="rarity-counters">
          {Object.keys(totalByRarity).map((rarity) => (
            <RarityCounter
              key={rarity}
              rarity={rarity}
              selected={selectedByRarity[rarity] || 0}
              total={totalByRarity[rarity]}
            />
          ))}
        </div>
      </CollapsibleBar>

      {/* Filtres et tri */}
      <div className="filters">
        <div>
          <label htmlFor="rarity-select">🔎 Filtrer par rareté :</label>
          <select
            id="rarity-select"
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="mythic">Mythic</option>
          </select>
        </div>

        <div>
          <label htmlFor="checked-select">✔️ Filtrer par sélection :</label>
          <select
            id="checked-select"
            value={checkedFilter}
            onChange={(e) => setCheckedFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="checked">Cochées</option>
            <option value="unchecked">Non cochées</option>
          </select>
        </div>

        <div>
          <label htmlFor="booster-select">🎁 Filtrer par booster :</label>
          <select
            id="booster-select"
            value={boosterFilter}
            onChange={(e) => setBoosterFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            <option value="booster">Obtenables en booster</option>
            <option value="non-booster">Non obtenables</option>
          </select>
        </div>

        <div>
          <label>Trier par :</label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
            <option value="price-asc">Prix (↑)</option>
            <option value="price-desc">Prix (↓)</option>
            <option value="number-asc">Numéro (↑)</option>
            <option value="number-desc">Numéro (↓)</option>
          </select>
        </div>
      </div>

      <hr className="divider" />

      {/* Liste des cartes */}
      <div className="card-list">
        {filteredAndSortedCards.map((card) => (
          <div key={card.name} className="card">
            <div className="card-image-wrapper">
              <img
                src={card.image_url}
                alt={card.name}
                onClick={() => toggleCard(card.name, !card.checked)}
              />
              {card.booster && (
                <div className="booster-indicator" title="Carte obtenable en booster">
                  🎁 Booster
                </div>
              )}
            </div>

            <div className="card-info centered-text">
              <div className="card-name">{card.name}</div>
              <div className="card-subinfo">
                {card.collector_number} • <span className="rarity">{card.rarity}</span>
              </div>
              <div className="card-price">💶 {card.price.toFixed(2)} €</div>

              <label className="card-checkbox">
                <input
                  type="checkbox"
                  checked={card.checked}
                  onChange={(e) => toggleCard(card.name, e.target.checked)}
                />
                Marquer cette carte
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Composant qui affiche un compteur de rareté avec une barre de progression.
 */
function RarityCounter({ rarity, selected, total }) {
  const percentage = total === 0 ? 0 : (selected / total) * 100;

  const colors = {
    common: "#a0a0a0",
    uncommon: "#4caf50",
    rare: "#2196f3",
    mythic: "#ff9800",
  };

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{
        fontWeight: "bold",
        marginBottom: "4px",
        textTransform: "capitalize",
        color: colors[rarity] || "#000",
      }}>
        {rarity} : {selected} / {total}
      </div>
      <div style={{
        background: "#e0e0e0",
        height: "10px",
        borderRadius: "5px",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${percentage}%`,
          backgroundColor: colors[rarity] || "#999",
          height: "100%",
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
}

export default CardList;
