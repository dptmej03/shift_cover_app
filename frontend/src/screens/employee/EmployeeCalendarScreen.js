import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity,
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

export default function EmployeeCalendarScreen() {
  const today = getToday();
  const [month, setMonth] = useState(getMonth());
  const [schedules, setSchedules] = useState([]);
  const [wageSummary, setWageSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => { fetchData(); }, [month]);

  const fetchData = async () => {
    try {
      const [schRes, wageRes] = await Promise.all([
        api.get('/schedules/my', { params: { month } }),
        api.get('/wages/my', { params: { month } }),
      ]);
      setSchedules(schRes.data);
      setWageSummary(wageRes.data);
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

  return (
    <View style={styles.container}>
      {/* 상단 급여 배너 */}
      {wageSummary && (
        <View style={styles.wageBanner}>
          <View>
            <Text style={styles.bannerLabel}>이번 달 총 근무</Text>
            <Text style={styles.bannerHours}>{wageSummary.total_hours}시간</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.bannerLabel}>예상 급여</Text>
            {wageSummary.estimated_wage != null
              ? <Text style={styles.bannerWage}>{wageSummary.estimated_wage.toLocaleString()}원</Text>
              : <Text style={styles.bannerWageGray}>시급 확인 중...</Text>
            }
          </View>
          {wageSummary.hourly_wage && (
            <View style={styles.hourlyBadge}>
              <Text style={styles.hourlyText}>시급 {wageSummary.hourly_wage.toLocaleString()}원</Text>
            </View>
          )}
        </View>
      )}

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
        }}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* 이달 일정 미리보기 */}
        <Text style={styles.sectionTitle}>📋 이달 근무 일정</Text>
        {schedules.length === 0 ? (
          <Text style={styles.emptyText}>등록된 근무 일정이 없습니다</Text>
        ) : (
          schedules.map(s => (
            <View key={s.id} style={styles.scheduleCard}>
              <View style={[styles.typePill, { backgroundColor: s.schedule_type === 'fixed' ? '#E3F2FD' : '#FFF3EF' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: s.schedule_type === 'fixed' ? '#1565C0' : COLORS.orange }}>
                  {s.schedule_type === 'fixed' ? '고정' : '대타'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.schedDate}>{s.date}</Text>
                <Text style={styles.schedTime}>{s.start_time} ~ {s.end_time}</Text>
              </View>
            </View>
          ))
        )}

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: '#42A5F5' }]} /><Text style={styles.legendText}>고정 근무</Text></View>
          <View style={styles.legendRow}><View style={[styles.dot, { backgroundColor: COLORS.orange }]} /><Text style={styles.legendText}>확정 대타</Text></View>
        </View>
      </ScrollView>

      {/* 날짜 클릭 모달 */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>📅 {selectedDate} 내 근무</Text>
            {daySchedules.length === 0
              ? <Text style={styles.emptyText}>이 날은 근무가 없어요 😊</Text>
              : daySchedules.map(s => (
                <View key={s.id} style={styles.modalRow}>
                  <View style={[styles.typePill, { backgroundColor: s.schedule_type === 'fixed' ? '#E3F2FD' : '#FFF3EF' }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: s.schedule_type === 'fixed' ? '#1565C0' : COLORS.orange }}>
                      {s.schedule_type === 'fixed' ? '고정' : '대타'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#212121' }}>{s.start_time} ~ {s.end_time}</Text>
                </View>
              ))
            }
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  wageBanner: { backgroundColor: COLORS.orange, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' },
  bannerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  bannerHours: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerWage: { fontSize: 22, fontWeight: '800', color: '#fff' },
  bannerWageGray: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  divider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  hourlyBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginLeft: 'auto' },
  hourlyText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#212121', marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.gray, textAlign: 'center', paddingVertical: 16 },
  scheduleCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  schedDate: { fontSize: 14, fontWeight: '700', color: '#212121' },
  schedTime: { fontSize: 12, color: COLORS.gray, marginTop: 2 },
  typePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingVertical: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: COLORS.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#212121', marginBottom: 16 },
  modalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
});
