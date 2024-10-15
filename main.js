/* 読み込むjsonファイル */
const jsonFiles = [
    'cards/servant.json',
    'cards/WX24-P3.json',
    'cards/WX24-P2.json',
    'cards/WX24-P1.json',
    'cards/WXDi-P16.json'
];

/* allCardsData配列を初期化 */
let allCardsData = [];
/* タッチ開始時のY座標初期値を設定 */
let touchStartY = 0;
/* Life Burstボタンの状態を0にリセット */
let lifeBurstState = 0;
/* 現在のカードを記録する変数 */
let currentCard;

/* DOM読込完了時に実行 */
document.addEventListener('DOMContentLoaded', () => {

    /* jsonファイルからカードのデータを取得し、リスト欄に表示 */
    Promise.all(jsonFiles.map(file => fetch(file) // jsonFilesの各要素をfetchで取得
        .then(response => response.json()) // 取得してきたもの（response）をjsonにする
    ))
    .then(responses => {
        responses.forEach(responseData => { // すべてのjsonを取得したら、forEachを実行
            allCardsData = allCardsData.concat(responseData); // 取得したjsonたちを、allCardsDataにまとめる
        });
        window.cardsData = allCardsData; // windowオブジェクトにする
        displayCards(window.cardsData); // リスト欄に表示
    })
    .catch(error => {
        console.error("JSONファイルが読み込めなかったっぽい!:", error); // エラーが出たら困る
    });

    /* ステータス欄を更新(初期化) */
    updateDeckStatus();

    /* レベル選択ボタンの処理 */
    const levelButtons = document.querySelectorAll('.search-level-button');
    const selectedLevels = new Set();  // 選択されたレベルを管理
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const level = button.dataset.level;
            /* ボタンのオン・オフを切り替え */
            if (selectedLevels.has(level)) {
                selectedLevels.delete(level);
                button.classList.remove('active');  // オフ状態
            } else {
                selectedLevels.add(level);
                button.classList.add('active');  // オン状態
            }
            /* 検索を実行 */
            handleSearch();
        });
    });

    /* 色選択ボタンの処理 */
    const colorButtons = document.querySelectorAll('.search-color-button');
    const selectedColors = new Set();  // 選択された色を管理
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;
            /* ボタンのオン・オフを切り替え */
            if (selectedColors.has(color)) {
                selectedColors.delete(color);
                button.classList.remove('active');  // オフ状態のスタイル
            } else {
                selectedColors.add(color);
                button.classList.add('active');  // オン状態のスタイル
            }
            /* 検索を実行 */
            handleSearch();
        });
    });

    /* LBボタンのクリックイベント */
    const lifeBurstButton = document.getElementById('lb-search-button');
    lifeBurstButton.addEventListener('click', function() {
        lifeBurstState = (lifeBurstState + 1) % 3; // クリックごとにlifeBurstStateを1増やす（0→1→2→0のループ）
        /* 状態に応じてボタンの背景色を変更 */
        switch (lifeBurstState) {
            case 0:
                this.style.backgroundColor = ""; // デフォルト
                break;
            case 1:
                this.style.backgroundColor = "green"; // LBあり
                break;
            case 2:
                this.style.backgroundColor = "red"; // LBなし
                break;
        }
        /* 検索を実行 */
        handleSearch();
    });

    /* カード名検索のイベントリスナーを追加 */
    const searchInput = document.getElementById('search-text-input');
    searchInput.addEventListener('input', handleSearch);

    /* カード種類検索のポップアップ */
    const openSearchCardTypePopupButton = document.getElementById('open-searchCardTypePopup-button');   // 検索ポップアップを表示させるボタンを取得
    openSearchCardTypePopupButton.addEventListener('click', function() {                                // ボタンを押したときの処理を追加
        const cardTypePopup = document.getElementById('search-cardType-popup');                         // 検索ポップアップを取得
        cardTypePopup.classList.add('active');                                                          // active状態に(ポップアップを表示)
        /* ポップアップ内の検索ボタン */
        if (cardTypePopup.classList.contains('active')) {                                               // activeになったら処理を追加
            const searchCardTypeButtons = document.querySelectorAll('.search-cardType-button');         // ポップアップ上のボタンたちを取得
            searchCardTypeButtons.forEach(button => {                                                   // 下記の処理を繰り返し(ボタンたちすべてに行う)
                button.addEventListener('click', function() {                                           // ボタンを押したときの処理を追加
                    const selectedCardType = button.dataset.cardtype;                                   // 押したボタンのdatasetを取得
                    document.getElementById('search-cardType-popup').dataset.selectedCardType = selectedCardType;   // 押したボタンのdatasetをポップアップに渡す(検索に使用)
                    cardTypePopup.classList.remove('active');                                           // active状態を外す(ポップアップを非表示)
                    handleSearch();                                                                     // 検索を実行
                })
            })
        }
    })

    /* ルリグタイプ/クラス検索のポップアップ */
    const openSearchLrigTypeClassPopupButton = document.getElementById('open-searchLrigTypeClassPopup-button'); // 検索ポップアップを表示させるボタンを取得
    openSearchLrigTypeClassPopupButton.addEventListener('click', function() {                                   // ボタンを押したときの処理を追加
        const lrigTypeClassPopup = document.getElementById('search-lrigTypeClass-popup');                         // 検索ポップアップを取得
        lrigTypeClassPopup.classList.add('active');                                                               // active状態に(ポップアップを表示)
        /* ポップアップ内の検索ボタン */
        if (lrigTypeClassPopup.classList.contains('active')) {                                                    // activeになったら処理を追加
            const searchLrigTypeClassButtons = document.querySelectorAll('.search-lrigTypeClass-button');           // ポップアップ上のボタンたちを取得
            searchLrigTypeClassButtons.forEach(button => {                                                          // 下記の追加処理を繰り返し(ボタンたちすべてに行う)
                /* ボタンを押したときの処理を追加 */
                button.addEventListener('click', function() {
                    const selectedLrigTypeClass = button.dataset.lrigtypeclass;                                       // 押したボタンのdatasetを取得
                    lrigTypeClassPopup.dataset.selectedLrigTypeClass = selectedLrigTypeClass;                         // 押したボタンのdatasetをポップアップに渡す(検索に使用)
                    const openPopupButtonImg = openSearchLrigTypeClassPopupButton.querySelector('img');               // 検索ポップアップを表示させるボタンのimgを取得
                    const selectedLrigTypeClassImg = button.querySelector('img').src;                                 // 押したボタンのimg(src)を取得
                    openPopupButtonImg.src = selectedLrigTypeClassImg;                                                // 押したボタンのimgを表示ボタンに渡す
                    lrigTypeClassPopup.classList.remove('active');                                                    // active状態を外す(ポップアップを非表示)
                    handleSearch();                                                                                   // 検索を実行
                });
            });
        }
    });
});

/* リスト欄にカードを表示させる関数 */
function displayCards(cards) {

    /* カードを表示させる場所としてcards-containerを取得 */
    const cardsContainer = document.getElementById('cards-container');

    /* リスト欄にカードを表示 */
    cards.forEach(card => {
        /* cards-containerに追加する<div class="card">を作成 */
        const cardElement = document.createElement('div');            // <div>を作成（jsではcardElementで参照）
        cardElement.classList.add('card');                            // classにcardを設定
        /* <div>にカード画像<img src="URL">を追加 */
        const cardImage = document.createElement('img');              // <img>を作成
        cardImage.src = card.image;                                   // imgにsrcでカード画像（URL）を設定
        cardElement.appendChild(cardImage);                           // 作成した<img>を<div>に追加
        /* カードにフリックのリスナーを追加 */
        cardElement.addEventListener('touchstart', handleTouchStart); // タップしたときにhandleTouchStartを呼び出すリスナーを追加
        cardElement.addEventListener('touchend', (event) => {         // タップ終了時のリスナーを追加
            currentCard = card;                                         // 触れているカードをcurrentCardとして保存(handleTouchEndで使用)
            handleTouchEnd(event);                                      // handleTouchEndを呼び出す
        });
        /* 作成した<div>をcards-containerに追加 */
        cardsContainer.appendChild(cardElement);
    });
}

/* ステータス欄を更新する関数 */
function updateDeckStatus() {

    /* メインデッキを取得 */
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
        const cardName = cardElement.dataset.name;                              // カードのdatasetの名前を取得
        const cardData = window.cardsData.find(card => card.name === cardName); // カードリストから名前で検索し、データを取得
        /* レベルごとのカウント */
        if (cardData && cardData.level === 1) {lv1StatusCount++;}               // Lv1
        if (cardData && cardData.level === 2) {lv2StatusCount++;}               // Lv2
        if (cardData && cardData.level === 3) {lv3StatusCount++;}               // Lv3
        /* 色ごとのカウント */
        if (cardData && cardData.color.includes("白")) {whiteStatusCount++;}    // 白
        if (cardData && cardData.color.includes("赤")) {redStatusCount++;}      // 赤
        if (cardData && cardData.color.includes("青")) {blueStatusCount++;}     // 青
        if (cardData && cardData.color.includes("緑")) {greenStatusCount++;}    // 緑
        if (cardData && cardData.color.includes("黒")) {blackStatusCount++;}    // 黒
        /* LBのカウント */
        if (cardData && cardData.lifeBurst === 1) {lbStatusCount++;}            // lifeBurstが1のカードをカウント
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

    /* 検索結果を表示させる場所として#cards-containerを取得 */
    const cardsContainer = document.getElementById('cards-container');
    /* 検索結果を一度リセット */
    cardsContainer.innerHTML = '';

    /* 検索条件を取得 */
    const searchTerm = document.getElementById('search-text-input').value.toLowerCase(); // #search-text-inputからテキストを取得（小文字に変換）しsearchTermにする
    const selectedLevels = Array.from(document.querySelectorAll('.search-level-button.active')).map(button => button.dataset.level); // .search-level-button.active（押されたLv選択ボタン）から選ばれたLvを取得してselectedLevelsにする
    const selectedColors = Array.from(document.querySelectorAll('.search-color-button.active')).map(button => button.dataset.color); // .search-color-button.active（押された色選択ボタン）から選ばれた色を取得してselectedColorsにする
    const selectedCardType = document.getElementById('search-cardType-popup').dataset.selectedCardType || ""; // #search-cardType-inputドロップダウンから選ばれたカード種類を取得してselectedCardTypeにする
    const selectedLrigTypeClass = document.getElementById('search-lrigTypeClass-popup').dataset.selectedLrigTypeClass || ""; // lrigTypeClassが空なら全てで検索、選択されていればselectedLrigTypeClassが含まれているか確認

    /* window.cardsDataの中からカードを検索してfilteredCardsに保存 */
    let filteredCards = window.cardsData.filter(card => {
        /* 各種条件で検索 */
        const nameMatch = card.name.toLowerCase().includes(searchTerm); // カード名（小文字に変換）にsearchTerm含んでいるかを確認
        const subNameMatch = card.subName && card.subName.some(sub => sub.toLowerCase().includes(searchTerm)); // subNameがあれば、同様にsearchTermを含んでいるか確認
        const cardTypeMatch = selectedCardType === "" || (card.cardType && card.cardType.includes(selectedCardType)); // selectedCardTypeが空なら全てで検索、選択されていればselectedCardTypeがcardTypeに含まれているか確認
        const lrigTypeClassMatch = selectedLrigTypeClass === "" || (card.lrigTypeClass && card.lrigTypeClass.includes(selectedLrigTypeClass)); // lrigTypeClassのフィルタリング
        const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(card.level.toString()); // selectedLevelsが選択されていなければ全てで検索、選択されていればいずれかに一致するか確認
        const colorMatch = selectedColors.length === 0 || selectedColors.some(color => card.color.includes(color)); // selectedColorsが選択されていなければ全てで検索、選択されていればいずれかに一致するか確認
        const lifeBurstMatch = (
            (lifeBurstState === 0) ||  // lifeBurstStateが0であれば全てで検索
            (lifeBurstState === 1 && card.lifeBurst === 1) ||  // lifeBurstStateが1であればLBありで検索
            (lifeBurstState === 2 && card.lifeBurst === 0)     // lifeBurstStateが2であればLBなしで検索
        );
        /* 全条件で検索 */
        return (nameMatch || subNameMatch) && cardTypeMatch && lrigTypeClassMatch && levelMatch && colorMatch && lifeBurstMatch;
    });

    /* 検索結果filteredCardsをdisplayCards関数で表示 */
    displayCards(filteredCards);
}

/* リスト欄のフリック設定 */
/* タッチ開始時にY座標を保存 */
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}
/* リスト欄のカード上下フリックでデッキに追加 */
function handleTouchEnd(event) {
    /* タッチ終了時のY座標を取得し、フリックの距離を計算 */
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    /* 上方向にフリックされた場合、addCardToDeck関数を1回処理 */
    if (swipeDistance > 50 && currentCard) {
        addCardToDeck(currentCard);
    }
    /* 下方向にフリックされた場合、addCardToDeck関数を4回処理 */
    else if (swipeDistance < -70 && currentCard) {
        for (let i = 0; i < 4; i++) {
            addCardToDeck(currentCard);
        }
    }
}

/* デッキにカードを追加する関数 */
function addCardToDeck(card) {

    /* カードを追加する場所としてlrig-deck-cardsとmain-deck-cardsを取得 */
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    /* deckに追加する<div class="card">を作成 */
    const cardElement = document.createElement('div'); // <div>を作成（jsではcardElementで参照）
    cardElement.classList.add('card'); // classにcardを設定
    /* <div>にカード画像<img src="URL">を追加 */
    const cardImage = document.createElement('img'); // <img>を作成
    cardImage.src = card.image; // imgにsrcでカード画像（URL）を設定
    cardElement.appendChild(cardImage); // 作成した<img>を<div>に追加
    /* <div>にカードのデータを追加 */
    cardElement.dataset.name = card.name; // カード名
    cardElement.dataset.cardType = card.cardType[0]; // カード種類（配列の最初の要素）
    cardElement.dataset.lrigTypeClass = card.lrigTypeClass[0]; // ルリグタイプ/クラス（配列の最初の要素）
    cardElement.dataset.level = card.level; // レベル

    /* <div>のdatasetからcardTypeを取得 */
    const cardType = cardElement.dataset.cardType;
    /* ルリグならルリグデッキに追加してソート */
    if (cardType ==='ルリグ') {
        /* ルリグデッキは8枚まで */
        if (lrigDeck.children.length >= 8) { // LrigDeckの枚数が8枚以上なら処理を停止
            return;
        }
        /* (センター)ルリグは1枚まで */
        const lrigDeckLrig = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckCardType = deckCard.dataset.cardType; // datasetからカード種類を取得
            return deckCardType === "ルリグ";  // ルリグがあるか確認
        });
        if (lrigDeckLrig.length >= 1 ) { // 1枚以上あるなら処理を停止
            return;
        }
        /* <div>をルリグデッキに追加 */
        lrigDeck.appendChild(cardElement);
        /* ルリグデッキをソート */
        sortLrigDeck();
    }
    /* アシストルリグならルリグデッキに追加してソート */
    else if(cardType === 'アシストルリグ') {
        /* ルリグデッキは8枚まで */
        if (lrigDeck.children.length >= 8) { // LrigDeckの枚数が8枚以上なら処理を停止
            return;
        }
        /* 同じレベルのアシストルリグは2枚まで */
        const lrigDeckSameLevelAssist = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckCardType = deckCard.dataset.cardType; // datasetからカード種類を取得
            const deckCardLevel = deckCard.dataset.level; // datasetからレベルを取得
            return deckCardType === "アシストルリグ" && deckCardLevel === cardElement.dataset.level; // 追加しようとしているカードと同じレベルのアシストルリグを確認
        });
        if (lrigDeckSameLevelAssist.length >= 2) { // 2枚以上あるなら処理を停止
            return;
        }
        /* 同じルリグタイプで同じレベルのカードは1枚まで */
        const lrigDeckSameLrigTypeAssist = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckLrigType = deckCard.dataset.lrigTypeClass; // datasetからルリグタイプを取得
            const deckCardLevel = deckCard.dataset.level; // datasetからレベルを取得
            return deckLrigType === cardElement.dataset.lrigTypeClass && deckCardLevel === cardElement.dataset.level; // 追加しようとしているカードと同じルリグタイプかつレベルのカードがあるかをチェック
        });
        if (lrigDeckSameLrigTypeAssist.length >= 1 ) { // 1枚以上あるなら処理を停止
            return;
        }
        /* <div>をルリグデッキに追加 */
        lrigDeck.appendChild(cardElement);
        /* ルリグデッキをソート */
        sortLrigDeck();
    }
    /* ピースならルリグデッキに追加してソート */
    else if(cardType === 'ピース') {
        /* ルリグデッキは8枚まで */
        if (lrigDeck.children.length >= 8) { // LrigDeckの枚数が8枚以上なら処理を停止
            return;
        }
        /* ピースは2枚まで */
        const lrigDeckPiece = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckCardType = deckCard.dataset.cardType; // datasetからカード種類を取得
            return deckCardType === "ピース"; // ピースの枚数を確認
        });
        if (lrigDeckPiece.length >= 2) { // 2枚以上あるなら処理を停止
            return;
        }
        /* 同名カードは１枚まで */
        const lrigDeckSameNameCard = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckCardName = deckCard.dataset.name; // datasetからカード名を取得
            return deckCardName === cardElement.dataset.name; // 追加しようとしているカードと同じものがあるかどうかをチェック
        });
        if (lrigDeckSameNameCard.length >= 1) { // 同じものがあるなら処理を停止
            return;
        }
        /* <div>をルリグデッキに追加 */
        lrigDeck.appendChild(cardElement);
        /* ルリグデッキをソート */
        sortLrigDeck();
    }
    /* アーツならルリグデッキに追加してソート */
    else if(cardType === 'アーツ') {
        /* ルリグデッキは8枚まで */
        if (lrigDeck.children.length >= 8) { // LrigDeckの枚数が8枚以上なら処理を停止
            return;
        }
        /* 同名カードは1枚まで */
        const lrigDeckSameNameCard = Array.from(lrigDeck.children).filter(deckCard => { // ルリグデッキの中身を配列で取得
            const deckCardName = deckCard.dataset.name; // datasetからカード名を取得
            return deckCardName === cardElement.dataset.name; // 取得したカード名の中に、追加しようとしているカードと同じものがあるかどうかをチェック
        });
        if (lrigDeckSameNameCard.length >= 1) { // 同じものがあるなら処理を停止
            return;
        }
        /* <div>をルリグデッキに追加 */
        lrigDeck.appendChild(cardElement);
        /* ルリグデッキをソート */
        sortLrigDeck();
    }
    /* シグニ,スペル,サーバントならメインデッキに追加してソート */
    else if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {
        /* メインデッキは40枚まで */
        if (mainDeck.children.length >= 40) { // MainDeckの枚数が40枚以上なら処理を停止
            return;
        }
        /* 同名カードは４枚まで */
        const mainSameNameCards = Array.from(mainDeck.children).filter(deckCard => { // メインデッキの中身を配列で取得
            const deckCardName = deckCard.dataset.name; // datasetからカード名を取得
            return deckCardName === cardElement.dataset.name; // 取得したカード名の中に、追加しようとしているカードと同じものがあるかどうかをチェック
        });
        if (mainSameNameCards.length >= 4) { // 4枚以上あるなら処理を停止
            return;
        }
        /* <div>をメインデッキに追加 */
        mainDeck.appendChild(cardElement);
        /* メインデッキをソート */
        sortMainDeck();
    }

    // カードにフリックイベントを追加
    cardElement.addEventListener('touchstart', handleTouchStart);
    cardElement.addEventListener('touchend', handleRemoveTouchEnd);
    cardElement.addEventListener('touchend', handleDuplicateTouchEnd);

    // ステータス欄を更新
    updateDeckStatus();
}

/* デッキ欄のカード上フリックでそのカードをさらに追加（複製）*/
function handleDuplicateTouchEnd(event) {

    /* タッチ終了時のY座標を取得し、フリックの距離を計算 */
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;

    /* 上方向にスワイプされた場合、カードを複製 */
    if (swipeDistance > 50 && event.currentTarget) {
        duplicateCard(event.currentTarget);
    }
}
/* 複製の関数 */
function duplicateCard(cardElement) {

    const cardName = cardElement.dataset.name;
    const cardData = window.cardsData.find(card => card.name === cardName);
    // addCardToDeck関数を使ってカードを追加
    addCardToDeck(cardData);
}
/* デッキ欄のカードを下フリックでデッキから削除 */
function handleRemoveTouchEnd(event) {

    /* タッチ終了時のY座標を取得し、フリックの距離を計算 */
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchEndY - touchStartY;

    /* 下方向にスワイプされた場合、カードを削除 */
    if (swipeDistance > 50 && event.currentTarget) {
        removeCardFromDeck(event.currentTarget);
    }
}
/* 削除の関数 */
function removeCardFromDeck(cardElement) {
    const lrigDeck = document.getElementById('lrig-deck-cards');
    const mainDeck = document.getElementById('main-deck-cards');

    if (lrigDeck.contains(cardElement)) {
        lrigDeck.removeChild(cardElement);
        sortLrigDeck();
    } else if (mainDeck.contains(cardElement)) {
        mainDeck.removeChild(cardElement);
        sortMainDeck();
    }

    /* ステータス欄を更新 */
    updateDeckStatus();
}

/* ルリグデッキのソート */
function sortLrigDeck() {

    /* ルリグデッキの要素を配列にして取得 */
    const lrigDeck = document.getElementById('lrig-deck-cards'); // #lrig-deck-cardsをlrigDeckとして取得
    const cardElements = Array.from(lrigDeck.children); // lrigDeckの子要素（ルリグデッキのカード）を配列で取得

    /* カード種類によるソート順を設定 */
    const lrigDeckOrder = {
        'ルリグ': 1,
        'アシストルリグ': 2,
        'ピース': 3,
        'アーツ': 4
    };

    /* ソート */
    cardElements.sort((a, b) => {
        /* カード種類でソート */
        const aCardType = lrigDeckOrder[a.dataset.cardType] || 5; // カード種類を取得し、ソート順に応じた値を持たせる
        const bCardType = lrigDeckOrder[b.dataset.cardType] || 5;
        if (aCardType !== bCardType) {
            return aCardType - bCardType // 違うカード種類ならソート
        }
        /* アシストルリグのソート */
        if (a.dataset.cardType === 'アシストルリグ' && b.dataset.cardType === 'アシストルリグ') {
            /* ルリグタイプでソート */
            const aLrigTypeClass = a.dataset.lrigTypeClass; // ルリグタイプを取得
            const bLrigTypeClass = b.dataset.lrigTypeClass;
            if (aLrigTypeClass !== bLrigTypeClass) {
                return aLrigTypeClass.localeCompare(bLrigTypeClass); // 違うルリグタイプなら文字列でソート
            }
            /* ルリグタイプが同じならレベルでソート */
            const aLevel = a.dataset.level; // レベルを取得
            const bLevel = b.dataset.level;
            return aLevel - bLevel; // aとbで比較
        }
        /* アシストルリグ以外で同じカード種類ならカード名でソート */
        const aName = a.dataset.name; // カード名を取得
        const bName = b.dataset.name;
        return aName.localeCompare(bName); // カード名でソート
    });

    lrigDeck.innerHTML = '';
    cardElements.forEach(element => lrigDeck.appendChild(element));
}
/* メインデッキソート */
function sortMainDeck() {

    /* メインデッキの要素を配列にして取得 */
    const mainDeck = document.getElementById('main-deck-cards'); // #main-deck-cardsをmainDeckとして取得
    const cardElements = Array.from(mainDeck.children); // mainDeckの子要素（メインデッキのカード）を配列で取得

    /* カード種類によるソート順を設定 */
    const mainDeckOrder = {
        'シグニ': 1,
        'スペル': 2,
        'サーバント': 3
    };

    /* ソート */
    cardElements.sort((a, b) => {
        /* カード種類でソート */
        const aCardType = mainDeckOrder[a.dataset.cardType] || 4; // カード種類を取得し、ソート順に応じた値を持たせる
        const bCardType = mainDeckOrder[b.dataset.cardType] || 4;
        if (aCardType !== bCardType) {
            return aCardType - bCardType // 違うカード種類ならaソート
        }
        /* 同じカード種類ならレベルでソート */
        const aLevel = a.dataset.level; // レベルを取得
        const bLevel = b.dataset.level;
        if (aLevel !== bLevel) {
        return aLevel - bLevel; // 違うレベルならソート
        }
        /* レベルが同じ場合、名前でソート */
        const aName = a.dataset.name; // カード名を取得
        const bName = b.dataset.name;
        return aName.localeCompare(bName); // カード名でソート
    });

    mainDeck.innerHTML = '';
    cardElements.forEach(element => mainDeck.appendChild(element));
}