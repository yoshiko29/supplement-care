document.addEventListener('DOMContentLoaded', () => {
    const supplementsList = document.getElementById('supplements-list');
    const addSupplementBtn = document.getElementById('add-supplement');
    const statusGrid = document.getElementById('status-grid');
    const morningTime = document.getElementById('morning-time');
    const noonTime = document.getElementById('noon-time');
    const eveningTime = document.getElementById('evening-time');
    const saveButton = document.getElementById('save-times');

    // 初期のサプリメントデータ
    let supplements = JSON.parse(localStorage.getItem('supplements') || '[]');
    if (supplements.length === 0) {
        supplements = [
            { id: 1, name: 'サプリメント1' },
            { id: 2, name: 'サプリメント2' },
            { id: 3, name: 'サプリメント3' }
        ];
    }

    // サプリメントの表示
    const renderSupplements = () => {
        supplementsList.innerHTML = supplements.map(supplement => `
            <div class="supplement-item" data-id="${supplement.id}">
                <input type="text" value="${supplement.name}" class="supplement-name">
                <button class="delete-btn" data-id="${supplement.id}">削除</button>
            </div>
        `).join('');
    };

    // ステータスの表示
    const renderStatus = () => {
        const today = new Date().toISOString().split('T')[0];
        const status = JSON.parse(localStorage.getItem('supplementStatus') || '{}');
        
        statusGrid.innerHTML = supplements.map(supplement => {
            const todayStatus = status[today]?.[supplement.id] || { morning: false, noon: false, evening: false };
            return `
                <div class="status-item" data-id="${supplement.id}">
                    <span>${supplement.name}</span>
                    <div class="status-time">朝</div>
                    <div class="status-check" id="morning-status-${supplement.id}">${todayStatus.morning ? '✅' : '❌'}</div>
                    <button class="check-btn" data-time="morning" data-id="${supplement.id}">飲んだ</button>

                    <div class="status-time">昼</div>
                    <div class="status-check" id="noon-status-${supplement.id}">${todayStatus.noon ? '✅' : '❌'}</div>
                    <button class="check-btn" data-time="noon" data-id="${supplement.id}">飲んだ</button>

                    <div class="status-time">夜</div>
                    <div class="status-check" id="evening-status-${supplement.id}">${todayStatus.evening ? '✅' : '❌'}</div>
                    <button class="check-btn" data-time="evening" data-id="${supplement.id}">飲んだ</button>
                </div>
            `;
        }).join('');
    };

    // ステータスの更新
    const updateStatus = (supplementId, timeOfDay) => {
        const today = new Date().toISOString().split('T')[0];
        const status = JSON.parse(localStorage.getItem('supplementStatus') || '{}');
        if (!status[today]) {
            status[today] = {};
        }
        if (!status[today][supplementId]) {
            status[today][supplementId] = { morning: false, noon: false, evening: false };
        }
        status[today][supplementId][timeOfDay] = true;
        localStorage.setItem('supplementStatus', JSON.stringify(status));
        
        // DOMを更新
        const statusElement = document.getElementById(`${timeOfDay}-status-${supplementId}`);
        if (statusElement) {
            statusElement.textContent = '✅';
            statusElement.classList.add('checked');
        }
    };

    // サプリメントの追加
    addSupplementBtn.addEventListener('click', () => {
        const newId = supplements.length > 0 ? supplements[supplements.length - 1].id + 1 : 1;
        supplements.push({ id: newId, name: `サプリメント${newId}` });
        saveSupplements();
        renderSupplements();
        renderStatus();
    });

    // サプリメントの削除
    supplementsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            supplements = supplements.filter(s => s.id !== parseInt(id));
            saveSupplements();
            renderSupplements();
            renderStatus();
        }
    });

    // サプリメント名の編集
    supplementsList.addEventListener('change', (e) => {
        if (e.target.classList.contains('supplement-name')) {
            const id = e.target.dataset.id;
            const newName = e.target.value;
            const index = supplements.findIndex(s => s.id === parseInt(id));
            if (index !== -1) {
                supplements[index].name = newName;
                saveSupplements();
                renderStatus();
            }
        }
    });

    // ステータスの更新イベントリスナー
    statusGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('check-btn')) {
            const supplementId = e.target.dataset.id;
            const timeOfDay = e.target.dataset.time;
            updateStatus(supplementId, timeOfDay);
        }
    });

    // サプリメントデータの保存
    const saveSupplements = () => {
        localStorage.setItem('supplements', JSON.stringify(supplements));
    };

    // 通知を設定
    const setNotifications = () => {
        if (!('Notification' in window)) {
            alert('このブラウザでは通知機能がサポートされていません');
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                // 朝の通知
                const morningNotify = new Date(today);
                const [morningHour, morningMinute] = morningTime.value.split(':');
                morningNotify.setHours(Number(morningHour), Number(morningMinute), 0);
                if (morningNotify > now) {
                    setTimeout(() => {
                        new Notification('サプリメントの時間です', {
                            body: 'サプリメントを飲みましたか？'
                        });
                    }, morningNotify - now);
                }

                // 昼の通知
                const noonNotify = new Date(today);
                const [noonHour, noonMinute] = noonTime.value.split(':');
                noonNotify.setHours(Number(noonHour), Number(noonMinute), 0);
                if (noonNotify > now) {
                    setTimeout(() => {
                        new Notification('サプリメントの時間です', {
                            body: 'サプリメントを飲みましたか？'
                        });
                    }, noonNotify - now);
                }

                // 夜の通知
                const eveningNotify = new Date(today);
                const [eveningHour, eveningMinute] = eveningTime.value.split(':');
                eveningNotify.setHours(Number(eveningHour), Number(eveningMinute), 0);
                if (eveningNotify > now) {
                    setTimeout(() => {
                        new Notification('サプリメントの時間です', {
                            body: 'サプリメントを飲みましたか？'
                        });
                    }, eveningNotify - now);
                }
            }
        });
    };

    // 設定を保存
    saveButton.addEventListener('click', () => {
        const settings = {
            morning: morningTime.value,
            noon: noonTime.value,
            evening: eveningTime.value
        };
        localStorage.setItem('supplementSettings', JSON.stringify(settings));
        setNotifications();
    });

    // 初期化
    renderStatus();
});
