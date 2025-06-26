function updateCounter() {
    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    const total = [...checkboxes].filter(c => c.checked).length;
    document.getElementById("counter").innerText = total;

    const rarityCounts = {
        'common': 0,
        'uncommon': 0,
        'rare': 0,
        'mythic': 0,
    };

    checkboxes.forEach(cb => {
        if (cb.checked) {
            const rarity = cb.getAttribute('data-rarity');
            if (rarityCounts.hasOwnProperty(rarity)) {
                rarityCounts[rarity]++;
            }
        }
    });

    // Lire les max depuis le DOM (via les data-* dans le HTML)
    const updateRarityDisplay = (rarity) => {
        const counterElement = document.getElementById(`${rarity}-counter`);
        const max = counterElement.dataset.max || 0;
        counterElement.innerText = `${rarityCounts[rarity]} / ${max}`;
    };

    updateRarityDisplay("common");
    updateRarityDisplay("uncommon");
    updateRarityDisplay("rare");
    updateRarityDisplay("mythic");
}

function toggleCheckbox(cardId, cardName) {
    const checkbox = document.getElementById(cardId);
    console.log(cardName);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;

        fetch("/update-selection", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                name: cardName,
                checked: checkbox.checked
            })
        }).then(response => {
            if (!response.ok) {
                alert("Erreur lors de l'enregistrement");
            }
        });

        updateCounter();
    }
}

function checkboxChanged(cardId, cardName) {
    fetch("/update-selection", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: cardName,
            checked: document.getElementById(cardId).checked
        })
    });
    updateCounter();
}

function toggleCheckboxFromElement(el) {
    const cardId = el.id;
    const cardName = el.getAttribute('data-name');
    toggleCheckbox(cardId, cardName);
}

function checkboxChangedFromElement(el) {
    const cardId = el.id;
    const cardName = el.getAttribute('data-name');
    checkboxChanged(cardId, cardName);
}

function applyFilter() {
    const filter = document.getElementById('filter-select').value;
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const checkbox = card.querySelector('input[type=checkbox]');
        if (!checkbox) return;

        if (filter === 'all') {
            card.style.display = 'inline-block';
        } else if (filter === 'checked') {
            card.style.display = checkbox.checked ? 'inline-block' : 'none';
        } else if (filter === 'unchecked') {
            card.style.display = !checkbox.checked ? 'inline-block' : 'none';
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    updateCounter();
    applyFilter();
});