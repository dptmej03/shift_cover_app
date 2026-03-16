import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity,
  FlatList, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import api from '../../api/client';
import { AuthContext } from '../../context/AuthContext';

const COLORS = { orange: '#FF7043', bg: '#FFF8F0', card: '#fff', gray: '#9E9E9E' };

function pad(n) { return String(n).padStart(2, '0'); }
function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function getMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function calcHours(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return ((eh * 60 + em) - (sh * 60 + sm)) / 60;
}

export default function ManagerCalendarScreen() {
  const { user } = useContext(AuthContext);
  const today = getToday();
  const [month, setMonth] = useState(getMonth());
  const [schedules, setSchedules] = useState([]);
  const [wages, setWages] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [wageModalVisible, setWageModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newWage, setNewWage] = useState('');
  // 고정 근무 추가
  const [addDate, setAddDate] = useState('');
  const [addStart, setAddStart] = useState('');
  const [addEnd, setAddEnd] = useState('');
  const [addEmpId, setAddEmpId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, [month]);

  const fetchData = async () => {
    try {
      const [schRes, wageRes] = await Promise.all([
        api.get('/schedules/store', { params: { month } }),
        api.get('/wages/monthly', { params: { month } }),
      ]);
      setSchedules(schRes.data);
      setWages(wageRes.data);
      // 알바생 목록은 wages에서 추출
      setEmployees(wageRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  // 캘린더 마킹
  const markedDates = {};
  schedules.forEach(s => {
    if (!markedDates[s.date]) markedDates[s.date] = { dots: [] };
    markedDates[s.date].dots.push({ color: s.schedule_type === 'fixed' ? '#42A5F5' : COLORS.orange });
  });
  if (selectedDate) {
    markedDates[selectedDate] = { ...(markedDates[selectedDate] || {}), selected: true, selectedColor: COLORS.orange };
  }

  const daySchedules = selectedDate ? schedules.filter(s => s.date === selectedDate) : [];

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const saveWage = async () => {
    if (!selectedEmployee || !newWage) return;
    try {
      await api.patch(`/wages/hourly/${selectedEmployee.employee_id}`, { hourly_wage: parseInt(newWage) });
      Alert.alert('저장 완료', '시급이 저장되었습니다!');
      setWageModalVisible(false);
      setNewWage('');
      fetchData();
    } catch (e) { Alert.alert('오류', e.message); }
  };

  const saveSchedule = async () => {
    if (!addEmpId || !addDate || !addStart || !addEnd) {
      return Alert.alert('오류', '모든 항목을 입력해주세요.');
    }
    setSaving(true);
    try {
      await api.post('/schedules', {
        employee_id: addEmpId,
        date: addDate,
        start_time: addStart,
        end_time: addEnd,
      });
      Alert.alert('등록 완료', '고정 근무가 등록되었습니다!');
      setAddModalVisible(false);
      setAddDate(''); setAddStart(''); setAddEnd(''); setAddEmpId(null);
      fetchData();
    } catch (e) { Alert.alert('오류', e.message); } finally { setSaving(false); }
  };

  // 알바생별 급여 카드
  const totalWage = wages.reduce((sum, e) => sum + (e.estimated_wage || 0), 0);

  return (
    <View style={styles.container}>
      <Calendar
        current={today}
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={m => setMonth(`${m.year}-${pad(m.month)}`)}
        theme={{
          selectedDayBackgroundColor: COLORS.orange,
          todayTextColor: COLORS.orange,
          arrowColor: COLORS.orange,
          dotColor: COLORS.orange,
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* 상단 이달 급여 요약 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📊 {month} 급여 현황</Text>
          <Text style={styles.summaryTotal}>총 지급 예상: <Text style={{ color: COLORS.orange }}>{totalWage.toLocaleString()}원</Text></Text>
        </View>

        {/* 알바생별 급여 */}
        {wages.map(emp => (
          <View key={emp.employee_id} style={styles.empCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.empName}>{emp.employee_name}</Text>
              <Text style={styles.empDetail}>{emp.total_hours}시간 × {emp.hourly_wage ? `${emp.hourly_wage.toLocaleString()}원` : '시급 미설정'}</Text>
              {emp.estimated_wage != null && (
                <Text style={styles.empWage}>{emp.estimated_wage.toLocaleString()}원</Text>
              )}
            </View>
            <TouchableOpacity style={styles.wageBtn} onPress={() => {
              setSelectedEmployee(emp);
              setNewWage(emp.hourly_wage ? String(emp.hourly_wage) : '');
              setWageModalVisible(true);
            }}>
              <Text style={styles.wageBtnText}>시급 설정</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>+ 고정 근무 등록</Text>
        </TouchableOpacity>

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#42A5F5' }]} /><Text style={styles.legendText}>고정 근무</Text></View>
          <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: COLORS.orange }]} /><Text style={styles.legendText}>확정 대타</Text></View>
        </View>
      </ScrollView>

      {/* 날짜 클릭 모달 – 당일 근무 목록 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>📅 {selectedDate} 근무 현황</Text>
            {daySchedules.length === 0
              ? <Text style={styles.emptyText}>등록된 근무가 없습니다</Text>
              : daySchedules.map(s => (
                <View key={s.id} style={styles.scheduleRow}>
                  <View style={[styles.typePill, { backgroundColor: s.schedule_type === 'fixed' ? '#E3F2FD' : '#FFF3EF' }]}>
                    <Text style={{ fontSize: 11, color: s.schedule_type === 'fixed' ? '#1565C0' : COLORS.orange, fontWeight: '700' }}>
                      {s.schedule_type === 'fixed' ? '고정' : '대타'}
                    </Text>
                  </View>
                  <Text style={styles.scheduleEmp}>{s.employee_name}</Text>
                  <Text style={styles.scheduleTime}>{s.start_time} ~ {s.end_time}</Text>
                  <Text style={styles.scheduleHours}>{calcHours(s.start_time, s.end_time).toFixed(1)}h</Text>
                </View>
              ))
            }
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 시급 설정 모달 */}
      <Modal visible={wageModalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setWageModalVisible(false)} activeOpacity={1}>
          <View style={styles.centerSheet}>
            <Text style={styles.sheetTitle}>💰 시급 설정</Text>
            <Text style={styles.empName}>{selectedEmployee?.employee_name}</Text>
            <TextInput style={[styles.input, { marginTop: 12 }]}
              placeholder="시급 (원)" keyboardType="numeric"
              value={newWage} onChangeText={setNewWage} />
            <TouchableOpacity style={styles.saveBtn} onPress={saveWage}>
              <Text style={styles.saveBtnText}>저장</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 고정 근무 등록 모달 */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setAddModalVisible(false)} activeOpacity={1}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>📝 고정 근무 등록</Text>
            <Text style={styles.label}>알바생 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {employees.map(e => (
                <TouchableOpacity key={e.employee_id} style={[styles.empChip, addEmpId === e.employee_id && styles.empChipSelected]}
                  onPress={() => setAddEmpId(e.employee_id)}>
                  <Text style={{ fontSize: 13, color: addEmpId === e.employee_id ? '#fff' : '#212121' }}>{e.employee_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.label}>날짜</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={addDate} onChangeText={setAddDate} />
            <Text style={styles.label}>시작 시간</Text>
            <TextInput style={styles.input} placeholder="HH:MM (예: 09:00)" value={addStart} onChangeText={setAddStart} />
            <Text style={styles.label}>종료 시간</Text>
            <TextInput style={styles.input} placeholder="HH:MM (예: 18:00)" value={addEnd} onChangeText={setAddEnd} />
            <TouchableOpacity style={styles.saveBtn} onPress={saveSchedule} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>등록하기</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  summaryCard: { backgroundColor: '#FFF3EF', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: COLORS.orange },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 4 },
  summaryTotal: { fontSize: 16, fontWeight: '800', color: '#212121' },
  empCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  empName: { fontSize: 15, fontWeight: '700', color: '#212121' },
  empDetail: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  empWage: { fontSize: 14, fontWeight: '700', color: COLORS.orange, marginTop: 4 },
  wageBtn: { backgroundColor: '#F5F5F5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  wageBtnText: { fontSize: 12, color: '#555', fontWeight: '600' },
  addBtn: { backgroundColor: COLORS.orange, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingVertical: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  centerSheet: { backgroundColor: COLORS.card, borderRadius: 20, margin: 32, padding: 24 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#212121', marginBottom: 16 },
  emptyText: { fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingVertical: 16 },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', gap: 8 },
  typePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  scheduleEmp: { flex: 1, fontSize: 14, fontWeight: '600', color: '#212121' },
  scheduleTime: { fontSize: 13, color: '#555' },
  scheduleHours: { fontSize: 13, fontWeight: '700', color: COLORS.orange, minWidth: 30, textAlign: 'right' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 12, fontSize: 14, color: '#212121', marginBottom: 4 },
  saveBtn: { backgroundColor: COLORS.orange, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  empChip: { backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  empChipSelected: { backgroundColor: COLORS.orange },
});
