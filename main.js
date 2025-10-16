document.addEventListener('DOMContentLoaded', () => {
    const latestApiUrl = 'https://api.lenalab.me/vitals';
    const monthlyApiUrl = 'https://api.lenalab.me/vitals/monthly';

    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    // 0をハイフンに変換するヘルパー関数
    const formatValue = (value) => (value === 0 ? '-' : value);

    Promise.all([
        fetch(latestApiUrl).then(res => res.json()),
        fetch(monthlyApiUrl).then(res => res.json())
    ])
    .then(([latestData, monthlyData]) => {
        updateSummaryCards(latestData, formatValue);
        updateMonthlyTable(monthlyData, formatValue);

        loadingDiv.style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('monthly-container').style.display = 'block';
    })
    .catch(error => {
        console.error('データの取得に失敗しました:', error);
        loadingDiv.style.display = 'none';
        errorDiv.textContent = 'データの取得に失敗しました。';
        errorDiv.style.display = 'block';
    });
});

function updateSummaryCards(data, formatter) {
    const dateStr = data.Date;
    const formattedDate = `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
    document.getElementById('record-date').textContent = formattedDate;

    // 各データをフォーマットしてから表示
    document.getElementById('weight').textContent = formatter(data.Weight);
    document.getElementById('glucose-morning').textContent = formatter(data.BloodGlucose.Morning);
    document.getElementById('glucose-evening').textContent = formatter(data.BloodGlucose.Evening);
    document.getElementById('bp-systolic').textContent = formatter(data.BloodPressure.Systolic);
    document.getElementById('bp-diastolic').textContent = formatter(data.BloodPressure.Diastolic);
}

function updateMonthlyTable(data, formatter) {
    const tableBody = document.getElementById('monthly-body');
    tableBody.innerHTML = '';

    data.forEach(record => {
        const dateStr = record.Date;
        const formattedDate = `${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
        
        // 血圧の表示を整形
        const bpSystolic = formatter(record.BloodPressure.Systolic);
        const bpDiastolic = formatter(record.BloodPressure.Diastolic);
        const bpDisplay = (bpSystolic === '-' && bpDiastolic === '-') ? '-' : `${bpSystolic} / ${bpDiastolic}`;

        const row = `
            <tr>
                <td>${formattedDate}</td>
                <td>${formatter(record.Weight)}</td>
                <td>${formatter(record.BloodGlucose.Morning)}</td>
                <td>${formatter(record.BloodGlucose.Evening)}</td>
                <td>${bpDisplay}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}