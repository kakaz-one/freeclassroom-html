// データをインポート
import { floors, days, dayNames, times, usedClassrooms } from './data.js';

// データ構造：教室の使用状況を管理
let classroomData = {};

// 初期化
function initializeData() {
    // まず実際に存在する教室を特定
    const actualRooms = {};
    usedClassrooms.forEach(item => {
        const roomNumber = item.room;
        if (roomNumber.match(/^5\d{3}$/)) {
            const floor = parseInt(roomNumber.charAt(1)); // 2桁目が階数
            if (floors.includes(floor)) {
                if (!actualRooms[floor]) actualRooms[floor] = new Set();
                actualRooms[floor].add(roomNumber);
            }
        }
    });

    // 全ての教室を空きとして初期化
    for (let floor of floors) {
        classroomData[floor] = {};
        for (let day of days) {
            classroomData[floor][day] = {};
            for (let time of times) {
                classroomData[floor][day][time] = {};
                
                // 実際に存在する教室のみ初期化
                if (actualRooms[floor]) {
                    actualRooms[floor].forEach(roomId => {
                        classroomData[floor][day][time][roomId] = true; // 初期は空き
                    });
                }
            }
        }
    }
    
    // 実際の使用データを反映
    usedClassrooms.forEach(item => {
        const roomNumber = item.room;
        // 5から始まる4桁の部屋番号のみ処理
        if (roomNumber.match(/^5\d{3}$/)) {
            const floor = parseInt(roomNumber.charAt(1)); // 2桁目が階数
            const dayKey = getDayKey(item.day);
            const time = parseInt(item.time);
            
            if (floors.includes(floor) && dayKey && times.includes(time)) {
                if (classroomData[floor] && 
                    classroomData[floor][dayKey] && 
                    classroomData[floor][dayKey][time] && 
                    classroomData[floor][dayKey][time][roomNumber] !== undefined) {
                    classroomData[floor][dayKey][time][roomNumber] = false; // 使用中
                }
            }
        }
    });
}

// 曜日名から曜日キーを取得
function getDayKey(dayName) {
    const dayMap = {
        '月': 'monday',
        '火': 'tuesday',
        '水': 'wednesday',
        '木': 'thursday',
        '金': 'friday'
    };
    return dayMap[dayName];
}

// 表示を更新
function updateDisplay() {
    const selectedDay = document.getElementById('daySelect').value;
    const selectedTime = parseInt(document.getElementById('timeSelect').value);
    const container = document.getElementById('floorsContainer');
    
    container.innerHTML = '';
    
    floors.forEach(floor => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col-lg-6 col-xl-3';
        
        const floorCard = document.createElement('div');
        floorCard.className = 'card floor-card h-100';
        
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header bg-primary text-white text-center';
        cardHeader.innerHTML = `<h5 class="mb-0"><i class="bi bi-building"></i> ${floor}階</h5>`;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-3';
        
        const classroomGrid = document.createElement('div');
        classroomGrid.className = 'classroom-grid';
        
        // 実際に存在する教室のみ表示
        if (classroomData[floor][selectedDay] && 
            classroomData[floor][selectedDay][selectedTime]) {
            
            Object.keys(classroomData[floor][selectedDay][selectedTime])
                .sort() // 部屋番号でソート
                .forEach(roomId => {
                    const classroom = document.createElement('div');
                    classroom.className = 'classroom p-2 text-center';
                    classroom.textContent = roomId;
                    classroom.dataset.roomId = roomId;
                    
                    const isAvailable = classroomData[floor][selectedDay][selectedTime][roomId];
                    classroom.classList.add(isAvailable ? 'available' : 'occupied');
                    
                    classroomGrid.appendChild(classroom);
                });
        }
        
        cardBody.appendChild(classroomGrid);
        floorCard.appendChild(cardHeader);
        floorCard.appendChild(cardBody);
        colDiv.appendChild(floorCard);
        container.appendChild(colDiv);
    });
}

// イベントリスナーを設定
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('daySelect').addEventListener('change', updateDisplay);
    document.getElementById('timeSelect').addEventListener('change', updateDisplay);
    
    initializeData();
    updateDisplay();
}); 