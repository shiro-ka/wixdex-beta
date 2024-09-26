/* jsonファイル群を読み込む */
const jsonFiles = [
    'cards/servant.json',
    'cards/WX24-P3.json',
    'cards/WXDi-P16.json',
    'cards/WXDi-P00.json'
];

/* グローバルスコープで宣言 */
let allCardsData = [];
// タッチ開始時のY座標初期値を設定
let touchStartY = 0;
// Life Burstボタンの状態
let lifeBurstState = 0;
// 現在のカードを記録する変数
let currentCard;

/* DOM読込完了時に実行 */
document.addEventListener('DOMContentLoaded', () => {

    /* jsonファイル群からcards.jsonを取得 */
    Promise.all(
        jsonFiles.map(file =>
            fetch(file).then(response => response.json())
        )
    )
    .then(responses => {
        responses.forEach(responseData => {
            allCardsData = allCardsData.concat(responseData);
        });
        window.cardsData = allCardsData;
        displayCards(window.cardsData);
        updateDeckStatus();
    })
    .catch(error => {
        console.error("Error loading JSON files:", error);
    });

    /* カード名検索のイベントリスナーを追加 */
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);

    // カードタイプのプルダウン選択
    const searchTypeInput = document.getElementById('search-type-input');
    searchTypeInput.addEventListener('change', handleSearch);

    // レベル選択ボタンの処理
    const levelButtons = document.querySelectorAll('.level-button');
    const selectedLevels = new Set();  // 選択されたレベルを管理

    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const level = button.dataset.level;

            // ボタンのオン・オフを切り替え
            if (selectedLevels.has(level)) {
                selectedLevels.delete(level);
                button.classList.remove('active');  // オフ状態のスタイル
            } else {
                selectedLevels.add(level);
                button.classList.add('active');  // オン状態のスタイル
            }

            // 検索を実行
            console.log(window.cardsData);
            handleSearch();
        });
    });

    // 色選択ボタンの処理
    const colorButtons = document.querySelectorAll('.color-button');
    const selectedColors = new Set();  // 選択された色を管理

    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;

        // ボタンのオン・オフを切り替え
            if (selectedColors.has(color)) {
                selectedColors.delete(color);
                button.classList.remove('active');  // オフ状態のスタイル
            } else {
                selectedColors.add(color);
                button.classList.add('active');  // オン状態のスタイル
            }

            // 検索を実行
            console.log(window.cardsData);
            handleSearch();
        });
    });


    // LBボタンのクリックイベント
    const lifeBurstButton = document.getElementById('life-burst-toggle');
    //let lifeBurstState = 0; // 0: どっちも, 1: LBあり, 2: LBなし

    /* Life Burst ボタンのクリックイベントリスナー */
    lifeBurstButton.addEventListener('click', function() {
        lifeBurstState = (lifeBurstState + 1) % 3; // クリックごとにlifeBurstStateを1増やす（0→1→2→0のループ）

        // 状態に応じてボタンの背景色を変更
        switch (lifeBurstState) {
            case 0: // どっちも
                this.style.backgroundColor = "";  // デフォルトの色に戻す
                console.log("LBどっちもで検索");
                break;
            case 1: // LBあり
                this.style.backgroundColor = "green";  // LBありの色
                console.log("LBアリで検索");
                break;
            case 2: // LBなし
                this.style.backgroundColor = "red";  // LBなしの色
                console.log("LBナシで検索");
                break;
        }
        // 状態をログに出力
    console.log(`LifeBurstState updated to: ${lifeBurstState}`);
        handleSearch(); // 状態変更後、必ず検索を再実行
    });

});

/* ステータス欄を更新する関数 */
function updateDeckStatus() {

    /* メインデッキの要素を取得 */
    const mainDeck = document.getElementById('main-deck-cards');

    /* 各種カウントをリセット */
    let lv1StatusCount = 0; //Lv1
    let lv2StatusCount = 0; //Lv2
    let lv3StatusCount = 0; //Lv3
    let lbStatusCount = 0; //LB
    let whiteStatusCount = 0; //白
    let redStatusCount = 0; //赤
    let blueStatusCount = 0; //青
    let greenStatusCount = 0; //緑
    let blackStatusCount = 0; //黒

    /* メインデッキ内の各カードをチェック */
    Array.from(mainDeck.children).forEach(cardElement => {
        const cardName = cardElement.querySelector('p').textContent;
        const cardData = window.cardsData.find(card => card.name === cardName);

        /* levelが1のカードをカウント */
        if (cardData && cardData.level === 1) {
            lv1StatusCount++;
        }
        /* levelが2のカードをカウント */
        if (cardData && cardData.level === 2) {
            lv2StatusCount++;
        }
        /* levelが3のカードをカウント */
        if (cardData && cardData.level === 3) {
            lv3StatusCount++;
        }
        /* lifeBurstが1のカードをカウント */
        if (cardData && cardData.lifeBurst === 1) {
            lbStatusCount++;
        }
        /* colorに"白"が含まれるカードをカウント */
        if (cardData && cardData.color.includes("白")) {
            whiteStatusCount++;
        }
        /* colorに"赤"が含まれるカードをカウント */
        if (cardData && cardData.color.includes("赤")) {
            redStatusCount++;
        }
        /* colorに"青"が含まれるカードをカウント */
        if (cardData && cardData.color.includes("青")) {
            blueStatusCount++;
        }
        /* colorに"緑"が含まれるカードをカウント */
        if (cardData && cardData.color.includes("緑")) {
            greenStatusCount++;
        }
        /* colorに"黒"が含まれるカードをカウント */
        if (cardData && cardData.color.includes("黒")) {
            blackStatusCount++;
        }
    });

    /* 各種枚数を表示 */
    document.getElementById('lv1-status-count').textContent = `${lv1StatusCount}`; //Lv1
    document.getElementById('lv2-status-count').textContent = `${lv2StatusCount}`; //Lv2
    document.getElementById('lv3-status-count').textContent = `${lv3StatusCount}`; //Lv3
    document.getElementById('lb-status-count').textContent = `${lbStatusCount}`; //LB
    document.getElementById('white-status-count').textContent = `${whiteStatusCount}`; //白
    document.getElementById('red-status-count').textContent = `${redStatusCount}`; //赤
    document.getElementById('blue-status-count').textContent = `${blueStatusCount}`; //青
    document.getElementById('green-status-count').textContent = `${greenStatusCount}`; //緑
    document.getElementById('black-status-count').textContent = `${blackStatusCount}`; //黒
}

/* カードを検索 */
function handleSearch() {

    /* 検索条件を取得 */
    const searchTerm = document.getElementById('search-input').value.toLowerCase(); // #search-inputからテキストを取得（小文字に変換）しsearchTermにする
    const selectedType = document.getElementById('search-type-input').value; // #search-type-inputドロップダウンから選ばれたカード種類を取得してselectedTypeにする
    const selectedLevels = Array.from(document.querySelectorAll('.level-button.active')).map(button => button.dataset.level); // .level-button.active（押されたLv選択ボタン）から選ばれたLvを取得してselectedLevelsにする
    const selectedColors = Array.from(document.querySelectorAll('.color-button.active')).map(button => button.dataset.color); // .color-button.active（押された色選択ボタン）から選ばれた色を取得してselectedColorsにする

    /* 検索結果を表示させる場所として#cards-containerを取得 */
    const cardsContainer = document.getElementById('cards-container');
    /* 検索結果を一度リセット */
    cardsContainer.innerHTML = '';

    /* window.cardsDataの中からカードを検索してfilteredCardsに保存 */
    let filteredCards = window.cardsData.filter(card => {
        /* 各種条件で検索 */
        const nameMatch = card.name.toLowerCase().includes(searchTerm); // カード名（小文字に変換）にsearchTerm含んでいるかを確認
        const subNameMatch = card.subName && card.subName.some(sub => sub.toLowerCase().includes(searchTerm)); // subNameがあれば、同様にsearchTermを含んでいるか確認
        const typeMatch = selectedType === "" || card.type.includes(selectedType); // selectedTypeが空なら全てで検索、選択されていればselectedTypeがtypeに含まれているか確認
        const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(card.level.toString()); // selectedLevelsが選択されていなければ全てで検索、選択されていればいずれかに一致するか確認
        const colorMatch = selectedColors.length === 0 || selectedColors.some(color => card.color.includes(color)); // selectedColorsが選択されていなければ全てで検索、選択されていればいずれかに一致するか確認
        const lifeBurstMatch = (
            (lifeBurstState === 0) ||  // lifeBurstStateが0であれば全てで検索
            (lifeBurstState === 1 && card.lifeBurst === 1) ||  // lifeBurstStateが1であればLBありで検索
            (lifeBurstState === 2 && card.lifeBurst === 0)     // lifeBurstStateが2であればLBなしで検索
        );
        /* 全条件で検索 */
        return (nameMatch || subNameMatch) && typeMatch && levelMatch && colorMatch && lifeBurstMatch;
    });

    /* 検索結果filteredCardsをdisplayCards関数で表示 */
    displayCards(filteredCards);
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

/* デッキにカードを追加する関数 */
function addCardToDeck(card) {

    /* lrig-deck-cardsとmain-deck-cardsをで取得 */
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    /* deckに追加する<div class="card">を作成 */
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

    /* ルリグデッキに追加 */
    if (['ルリグ', 'アシストルリグ', 'ピース', 'アーツ'].includes(cardType)) {

        /* LrigDeckの枚数が8枚以上なら処理を停止 */
        if (lrigDeck.children.length >= 8) {
            return;
        }

        /* ルリグデッキ内の同名カードを確認 */
        const lrigSameNameCards = Array.from(lrigDeck.children).filter(deckCard => {
            const deckCardName = deckCard.querySelector('p').textContent;
            return deckCardName === card.name;
        });
        /* 1枚以上なら追加の処理を停止 */
        if (lrigSameNameCards.length >= 1) {
            return;
        }

        /* Lv3のルリグがデッキにあるか確認 */
        const lrigLevel3Cards = Array.from(lrigDeck.children).filter(deckCard => {
            const deckCardName = deckCard.querySelector('p').textContent;
            const deckCardData = window.cardsData.find(card => card.name === deckCardName);
            return deckCardData && deckCardData.type.includes("ルリグ") && deckCardData.level === 3;
        });
        /* 1枚以上なら追加の処理を停止 */
        if (lrigLevel3Cards.length >= 1 && card.type.includes("ルリグ") && card.level === 3) {
            return;
        }

        lrigDeck.appendChild(cardElement);
        sortLrigDeck();
    }

    /* メインデッキに追加 */
    else if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {

        /* MainDeckの枚数が40枚以上なら処理を停止 */
        if (mainDeck.children.length >= 40) {
            return;
        }

        /* メインデッキ内の同名カードの数を確認 */
        const mainSameNameCards = Array.from(mainDeck.children).filter(deckCard => {
            const deckCardName = deckCard.querySelector('p').textContent;
            return deckCardName === card.name;
        });
        /* 4枚以上なら追加の処理を停止 */
        if (mainSameNameCards.length >= 4) {
            console.log(`Cannot add ${card.name} to Main Deck: More than 4 copies`);
            return;
        }

        mainDeck.appendChild(cardElement);
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