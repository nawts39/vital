document.addEventListener('DOMContentLoaded', () => {
    const monthlyApiUrl = 'https://api.lenalab.me/vitals/monthly';
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const ctx = document.getElementById('vitalsChart').getContext('2d');
    
    let chartInstance = null;
    let monthlyData = [];

    fetch(monthlyApiUrl)
        .then(res => {
            if (!res.ok) throw new Error('APIからの応答がありません');
            return res.json();
        })
        .then(data => {
            monthlyData = data.reverse();
            loadingDiv.style.display = 'none';
            renderGlucoseChart();
        })
        .catch(error => {
            console.error('データ取得エラー:', error);
            loadingDiv.style.display = 'none';
            errorDiv.textContent = 'グラフデータの取得に失敗しました。';
            errorDiv.style.display = 'block';
        });

    function renderChart(chartConfig) {
        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(ctx, chartConfig);
    }
    
    // --- 各グラフの描画関数 ---

    function renderGlucoseChart() {
        const combinedGlucoseData = [];
        monthlyData.forEach(d => {
            const date = d.Date;
            const morningValue = d.BloodGlucose.Morning;
            const eveningValue = d.BloodGlucose.Evening;

            // 0より大きい値のみをグラフのデータとして追加
            if (morningValue > 0) {
                combinedGlucoseData.push({
                    x: `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}T08:00:00`,
                    y: morningValue
                });
            }
            if (eveningValue > 0) {
                combinedGlucoseData.push({
                    x: `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}T20:00:00`,
                    y: eveningValue
                });
            }
        });

        renderChart({
            type: 'line',
            data: {
                datasets: [{
                    label: '血糖値',
                    data: combinedGlucoseData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    spanGaps: false // データがnullの場合に線を繋がない
                }]
            },
            options: {
                scales: {
                    x: { type: 'time', time: { unit: 'day', tooltipFormat: 'yyyy/MM/dd HH:mm', displayFormats: { day: 'MM/dd' } } },
                    y: { beginAtZero: false, title: { display: true, text: '血糖値 (mg/dL)' } }
                }
            }
        });
    }

    function renderWeightChart() {
        const labels = monthlyData.map(d => `${d.Date.substring(4, 6)}/${d.Date.substring(6, 8)}`);
        // 0の値をnullに変換
        const weightData = monthlyData.map(d => d.Weight === 0 ? null : d.Weight);
        
        renderChart({
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '体重 (kg)',
                    data: weightData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    spanGaps: false // データがnullの場合に線を繋がない
                }]
            }
        });
    }
    
    function renderBpChart() {
        const labels = monthlyData.map(d => `${d.Date.substring(4, 6)}/${d.Date.substring(6, 8)}`);
        // 0の値をnullに変換
        const systolicData = monthlyData.map(d => d.BloodPressure.Systolic === 0 ? null : d.BloodPressure.Systolic);
        const diastolicData = monthlyData.map(d => d.BloodPressure.Diastolic === 0 ? null : d.BloodPressure.Diastolic);

        renderChart({
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '最高血圧',
                    data: systolicData,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    spanGaps: false
                }, {
                    label: '最低血圧',
                    data: diastolicData,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    spanGaps: false
                }]
            }
        });
    }

    // --- ボタンのクリックイベント（変更なし） ---
    const buttons = { glucose: document.getElementById('btn-glucose'), weight: document.getElementById('btn-weight'), bp: document.getElementById('btn-bp') };
    function setActiveButton(activeBtn) {
        Object.values(buttons).forEach(btn => btn.classList.remove('active'));
        buttons[activeBtn].classList.add('active');
    }
    buttons.glucose.addEventListener('click', () => { setActiveButton('glucose'); renderGlucoseChart(); });
    buttons.weight.addEventListener('click', () => { setActiveButton('weight'); renderWeightChart(); });
    buttons.bp.addEventListener('click', () => { setActiveButton('bp'); renderBpChart(); });
});
