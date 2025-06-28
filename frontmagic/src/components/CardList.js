import React, {useState, useEffect} from "react";
import "./CardList.css";
import CollapsibleBar from "./CollapsibleBar";
import {FaCoins, FaGift, FaSortAmountDownAlt} from "react-icons/fa";

function CardList() {
    const [cards, setCards] = useState([]);
    const [rarityFilter, setRarityFilter] = useState("all");
    const [checkedFilter, setCheckedFilter] = useState("all");
    const [boosterFilter, setBoosterFilter] = useState("all");
    const [sortOption, setSortOption] = useState("name-asc");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(20);

    useEffect(() => {
        fetch("http://localhost:5000/api/cards")
            .then(res => res.json())
            .then(data => {
                setCards(data);
                setLoading(false);
            });
    }, []);

    const toggleCard = (name, isChecked) => {
        fetch("http://localhost:5000/api/update-selection", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, checked: isChecked})
        });

        setCards(prev => prev.map(card => card.name === name ? {...card, checked: isChecked} : card));
    };

    const totalCards = cards.length;
    const totalSelected = cards.filter(c => c.checked).length;
    const totalPrice = cards.reduce((sum, c) => sum + c.price, 0);
    const selectedPrice = cards.filter(c => c.checked).reduce((sum, c) => sum + c.price, 0);

    const totalByRarity = cards.reduce((acc, c) => {
        acc[c.rarity] = (acc[c.rarity] || 0) + 1;
        return acc;
    }, {});

    const selectedByRarity = cards.reduce((acc, c) => {
        if (c.checked) acc[c.rarity] = (acc[c.rarity] || 0) + 1;
        return acc;
    }, {});

    const filteredAndSortedCards = cards
        .filter(card => (rarityFilter === "all" || card.rarity === rarityFilter) && (checkedFilter === "all" || (checkedFilter === "checked" && card.checked) || (checkedFilter === "unchecked" && !card.checked)) && (boosterFilter === "all" || (boosterFilter === "booster" && card.booster) || (boosterFilter === "non-booster" && !card.booster)))
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

    const totalPages = Math.ceil(filteredAndSortedCards.length / cardsPerPage);
    const displayedCards = filteredAndSortedCards.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

    return (<div className="container">
        <h2 className="title">Nombre de cartes : {totalSelected} / {totalCards}</h2>

        <div className="price-summary">
            <div><FaCoins/> Valeur possédée : {selectedPrice.toFixed(2)} €</div>
            <div><FaCoins/> Valeur totale : {totalPrice.toFixed(2)} €</div>
        </div>

        <CollapsibleBar open={open} setOpen={setOpen} title="Progression des cartes">
            <div className="progress-bar-wrapper">
                <div className="progress-bar-fill" style={{width: `${(totalSelected / totalCards) * 100}%`}}/>
            </div>

            <div className="rarity-counters">
                {Object.keys(totalByRarity).map((rarity) => (<RarityCounter
                    key={rarity}
                    rarity={rarity}
                    selected={selectedByRarity[rarity] || 0}
                    total={totalByRarity[rarity]}
                />))}
            </div>
        </CollapsibleBar>

        <div className="filters">
            <div>
                <label htmlFor="rarity-select">🎨 Rareté :</label>
                <select id="rarity-select" value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)}>
                    <option value="all">Toutes</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="mythic">Mythic</option>
                </select>
            </div>
            <div>
                <label htmlFor="checked-select">✔️ Sélection :</label>
                <select id="checked-select" value={checkedFilter}
                        onChange={(e) => setCheckedFilter(e.target.value)}>
                    <option value="all">Toutes</option>
                    <option value="checked">Cochées</option>
                    <option value="unchecked">Non cochées</option>
                </select>
            </div>
            <div>
                <label htmlFor="booster-select">🎁 Booster :</label>
                <select id="booster-select" value={boosterFilter}
                        onChange={(e) => setBoosterFilter(e.target.value)}>
                    <option value="all">Toutes</option>
                    <option value="booster">Obtenables</option>
                    <option value="non-booster">Non obtenables</option>
                </select>
            </div>
            <div>
                <label><FaSortAmountDownAlt/> Trier par :</label>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                    <option value="name-asc">Nom (A-Z)</option>
                    <option value="name-desc">Nom (Z-A)</option>
                    <option value="price-asc">Prix (↑)</option>
                    <option value="price-desc">Prix (↓)</option>
                    <option value="number-asc">Numéro (↑)</option>
                    <option value="number-desc">Numéro (↓)</option>
                </select>
            </div>
            <div>
                <label htmlFor="cards-per-page">📄 Cartes par page :</label>
                <select
                    id="cards-per-page"
                    value={cardsPerPage}
                    onChange={(e) => {
                        setCardsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={totalCards}>Tout</option>
                </select>
            </div>
        </div>

        <hr className="divider"/>

        {loading ? <div>Chargement...</div> : filteredAndSortedCards.length === 0 ? (
            <div>Aucune carte ne correspond aux filtres.</div>) : (<div className="card-list">
            {displayedCards.map(card => (<div key={card.name} className="card">
                <div className="card-image-wrapper">
                    <img src={card.image_url} alt={card.name}
                         onClick={() => toggleCard(card.name, !card.checked)}/>
                    {card.booster && <div className="booster-indicator"><FaGift/> Booster</div>}
                </div>
                <div className="card-info centered-text">
                    <div className="card-name">{card.name}</div>
                    <div className="card-subinfo">{card.collector_number} • <span
                        className="rarity">{card.rarity}</span></div>
                    <div className="card-price">💶 {card.price.toFixed(2)} €</div>
                    <label className="card-checkbox">
                        <input type="checkbox" checked={card.checked}
                               onChange={(e) => toggleCard(card.name, e.target.checked)}/> Marquer cette
                        carte
                    </label>
                </div>
            </div>))}
        </div>)}
        <div style={{marginTop: '20px', textAlign: 'center'}}>
            <button className="btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                    title="Première page">
                ⏮️
            </button>
            <button className="btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                ◀️ Précédent
            </button>
            <span style={{margin: '0 10px'}}>
                    Page {currentPage} / {totalPages}
                </span>
            <button className="btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}>
                Suivant ▶️
            </button>
            <button className="btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} title="Dernière page">
            ⏭️
          </button>
        </div>
    </div>);
}

function RarityCounter({rarity, selected, total}) {
    const percentage = total === 0 ? 0 : (selected / total) * 100;
    const colors = {
        common: "#a0a0a0", uncommon: "#4caf50", rare: "#2196f3", mythic: "#ff9800",
    };

    return (<div style={{marginBottom: "12px"}}>
        <div style={{
            fontWeight: "bold", marginBottom: "4px", textTransform: "capitalize", color: colors[rarity] || "#000",
        }}>
            {rarity} : {selected} / {total}
        </div>
        <div style={{
            background: "#e0e0e0", height: "10px", borderRadius: "5px", overflow: "hidden",
        }}>
            <div style={{
                width: `${percentage}%`,
                backgroundColor: colors[rarity] || "#999",
                height: "100%",
                transition: "width 0.3s ease"
            }}/>
        </div>
    </div>);
}

export default CardList;
