// タッチ開始時のY座標初期値を設定
let touchStartY = 0;
// 現在のカードを記録する変数
let currentCard;

// DOM読込完了時に実行
document.addEventListener('DOMContentLoaded', () => {

    // cards.jsonを取得
    fetch('cards.json')
        .then(response => response.json())
        .then(responseData => {
            window.cardsData = responseData;
            displayCards(responseData);

            // 初回読込時にステータス欄を更新
            updateDeckStatus();
        })

        .catch(error => console.error('Error loading card data:', error));

    // 検索入力のイベントリスナーを設定
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);

    // プルダウンの検索イベントリスナー
    const searchTypeInput = document.getElementById('search-type-input');
    const searchLevelInput = document.getElementById('search-level-input');

    // プルダウンが変更されたときに検索実行
    searchTypeInput.addEventListener('change', handleSearch);
    searchLevelInput.addEventListener('change', handleSearch);

});

// ステータス欄を更新
function updateDeckStatus() {
    // メインデッキ要素を取得
     const mainDeck = document.getElementById('main-deck-cards');

    // メインデッキ内のlifeBurstのカウント
    let lifeBurstCount = 0;

    // メインデッキ内の各カードをチェック
    Array.from(mainDeck.children).forEach(cardElement => {
        const cardName = cardElement.querySelector('p').textContent;
        const cardData = window.cardsData.find(card => card.name === cardName);
        if (cardData && cardData.lifeBurst === 1) {
            lifeBurstCount++;
        }
    });

    // LB枚数を表示
    document.getElementById('life-burst-count').textContent = `${lifeBurstCount}`;
}


function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const searchType = document.getElementById('search-type-input').value;
    const searchLevel = document.getElementById('search-level-input').value;
    const cardsContainer = document.getElementById('cards-container');

    cardsContainer.innerHTML = ''; // 表示をクリア

    if (searchTerm === '' && searchType === '' && searchLevel === '') {
        // 条件がない場合は全カードを表示
        displayCards(window.cardsData);
        return;
    }

    // 絞り込み処理
    const filteredCards = window.cardsData.filter(card => {
        const nameMatch = card.name.toLowerCase().includes(searchTerm);
        const subnameMatch = card.subname && card.subname.some(sub => sub.toLowerCase().includes(searchTerm));
        const typeMatch = searchType === '' || card.type.includes(searchType);
        const levelMatch = searchLevel === '' || card.level == searchLevel;

        return (nameMatch || subnameMatch) && typeMatch && levelMatch;
    });

    displayCards(filteredCards); // 絞り込んだカードを表示
}



// displayCards関数
function displayCards(cards) {

    const cardsContainer = document.getElementById('cards-container');
    cards.forEach(card => {

        // cards-containerに追加する<div class="card">を作成
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        // URLからカード画像を設定
        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        // 画像が表示できなかった場合はカード名を表示
        cardImage.alt = card.name;

        // カードをcards-containerに表示
        cardElement.appendChild(cardImage);
        cardsContainer.appendChild(cardElement);

        // カードにフリックのリスナーを追加
        cardElement.addEventListener('touchstart', handleTouchStart);
        cardElement.addEventListener('touchend', (event) => {
            // 現在のカードを記録
            currentCard = card; 
            handleTouchEnd(event);
        });
    });
}

// リスト欄のフリックリスナー
function handleTouchStart(event) {
    // タッチ開始時のY座標を保存
    touchStartY = event.touches[0].clientY;
}

// リスト欄のカード上下フリックでデッキに追加
function handleTouchEnd(event) {

    // タッチ終了時のY座標を取得し、フリックの距離を計算
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;

    // 上方向にフリックされた場合、addCardToDeck関数を1回処理
    if (swipeDistance > 50 && currentCard) {
        addCardToDeck(currentCard);
    } 
    // 下方向にフリックされた場合、addCardToDeck関数を4回処理
    else if (swipeDistance < -50 && currentCard) {
        for (let i = 0; i < 4; i++) {
            addCardToDeck(currentCard);
        }
    }

    // ステータス欄を更新
    updateDeckStatus();
}

// デッキにカードを追加
function addCardToDeck(card) {

    // lrig-deck-cardsとmain-deck-cardsをjsで取得
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    // deckに追加する<div class="card">を作成
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');

    // URLからカード画像を設定
    const cardImage = document.createElement('img');
    cardImage.src = card.image;
    cardImage.alt = card.name;

    // カード名を表示する<p>要素を作成
    const cardName = document.createElement('p');
    cardName.textContent = card.name;

    // dataset にカードの種類とレベルを追加
    cardElement.dataset.type = card.type[0];
    cardElement.dataset.level = card.level;

    // cardElementに画像と名前を追加
    cardElement.appendChild(cardImage);
    cardElement.appendChild(cardName);

    // カード種類の最初の要素を取得
    const cardType = card.type[0];

    // ルリグデッキに追加
    if (['ルリグ', 'アシストルリグ', 'ピース', 'アーツ'].includes(cardType)) {
        if (lrigDeck.children.length >= 8) {
            console.log(`Cannot add ${card.name} to Lrig Deck: Deck is full`);
            return;
        }
        lrigDeck.appendChild(cardElement);
        console.log(`Added ${card.name} to Lrig Deck`);
        sortLrigDeck();

    // メインデッキに追加
    } else if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {

        // デッキ枚数は40枚まで
        if (mainDeck.children.length >= 40) {
            console.log(`Cannot add ${card.name} to Main Deck: Deck is full`);
            return;
        }

        // デッキ内の同名カードの数を確認
        const sameNameCards = Array.from(mainDeck.children).filter(deckCard => {
            const deckCardName = deckCard.querySelector('p').textContent;
            return deckCardName === card.name;
        });

        // 同名カードは4枚まで
        if (sameNameCards.length >= 4) {
            console.log(`Cannot add ${card.name} to Main Deck: More than 4 copies`);
            return;
        }

        mainDeck.appendChild(cardElement);
        console.log(`Added ${card.name} to Main Deck`);
        sortMainDeck();

    }

    // カードにフリックイベントを追加
    cardElement.addEventListener('touchstart', handleTouchStart);
    cardElement.addEventListener('touchend', handleRemoveTouchEnd);
    cardElement.addEventListener('touchend', handleDuplicateTouchEnd);

    // ステータス欄を更新
    updateDeckStatus();
}

// デッキ欄のカード上フリックでさらに追加
function handleDuplicateTouchEnd(event) {

    // タッチ終了時のY座標を取得し、フリックの距離を計算
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;

    // 上方向にスワイプされた場合、カードを複製
    if (swipeDistance > 50 && event.currentTarget) {
        duplicateCard(event.currentTarget);
    }
}

// 追加の関数
function duplicateCard(cardElement) {

    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    const cardName = cardElement.querySelector('p').textContent;
    const cardData = window.cardsData.find(card => card.name === cardName);

    if (!cardData) {
        console.log(`Card data not found for ${cardName}`);
        return;
    }

    // addCardToDeck関数を使ってカードを追加
    addCardToDeck(cardData);
}

// デッキ欄のカード下フリックでデッキから削除
function handleRemoveTouchEnd(event) {

    // タッチ終了時のY座標を取得し、フリックの距離を計算
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY;

    // 下方向にスワイプされた場合、カードを削除
    if (swipeDistance > 50 && event.currentTarget) {
        removeCardFromDeck(event.currentTarget);
    }
}

// 削除の関数　
function removeCardFromDeck(cardElement) {
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    if (lrigDeck.contains(cardElement)) {
        lrigDeck.removeChild(cardElement);
        console.log('Card removed from Lrig Deck');
        sortLrigDeck();
    } else if (mainDeck.contains(cardElement)) {
        mainDeck.removeChild(cardElement);
        console.log('Card removed from Main Deck');
        sortMainDeck();
    }

    // ステータス欄を更新
    updateDeckStatus();
}

// ルリグデッキソート
function sortLrigDeck() {
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const cardElements = Array.from(lrigDeck.children);

    // デバッグ: ソート前のカード情報
    console.log('Before sorting Lrig Deck:', cardElements.map(card => card.querySelector('p').textContent));

    const order = {
        'ルリグ': 1,
        'アシストルリグ': 2,
        'ピース': 3,
        'アーツ': 4
    };

    cardElements.sort((a, b) => {
        const aType = order[a.dataset.type] || 5;
        const bType = order[b.dataset.type] || 5;

        // デバッグ: 各カードの種類を表示
        console.log('aType:', aType, 'bType:', bType);

        return aType - bType;
    });

    lrigDeck.innerHTML = '';
    cardElements.forEach(element => lrigDeck.appendChild(element));

    // デバッグ: ソート後のカード情報
    console.log('After sorting Lrig Deck:', Array.from(lrigDeck.children).map(card => card.querySelector('p').textContent));
}

// メインデッキソート
function sortMainDeck() {
    const mainDeck = document.getElementById('main-deck-cards');
    const cardElements = Array.from(mainDeck.children);

    // デバッグ: ソート前のカード情報
    console.log('Before sorting Main Deck:', cardElements.map(card => ({
        name: card.querySelector('p').textContent,
        type: card.dataset.type,
        level: card.dataset.level
    })));

    const order = {
        'シグニ': 1,
        'スペル': 2,
        'サーバント': 3
    };

    cardElements.sort((a, b) => {
        const aType = order[a.dataset.type] || 4;
        const bType = order[b.dataset.type] || 4;

        if (aType !== bType) {
        return aType - bType;
        }

        // デバッグ: レベルと名前を確認
        const aLevel = parseInt(a.dataset.level, 10);
        const bLevel = parseInt(b.dataset.level, 10);
        console.log('aLevel:', aLevel, 'bLevel:', bLevel);

        if (aLevel !== bLevel) {
        return aLevel - bLevel;
        }

        // レベルが同じ場合、名前でソート
        const aName = a.querySelector('p').textContent;
        const bName = b.querySelector('p').textContent;

        return aName.localeCompare(bName);
    });

    mainDeck.innerHTML = '';
    cardElements.forEach(element => mainDeck.appendChild(element));

    // デバッグ: ソート後のカード情報
    console.log('After sorting Main Deck:', Array.from(mainDeck.children).map(card => ({
        name: card.querySelector('p').textContent,
        type: card.dataset.type,
        level: card.dataset.level
    })));
}