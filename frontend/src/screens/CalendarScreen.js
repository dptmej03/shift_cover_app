import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function CalendarScreen() {
  const { user } = useAuth();
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => { fetchCalendarData(); }, []));

  const fetchCalendarData = async () => {
    try {
      const marks = {};
      if (user.role === 'manager') {
        const res = await api.get('/shifts');
        res.data.forEach(shift => {
          marks[shift.date] = {
            marked: true,
            dotColor: shift.status === 'open' ? '#FF7043' : '#4CAF50',
            selected: false,
          };
        });
      } else {
        const res = await api.get('/applications/my');
        res.data.forEach(app => {
          // We need the shift date — skip if not available
          // (In real app, backend would return shift.date in application response)
        });
        // Also show all shifts
        const shiftsRes = await api.get('/shifts');
        shiftsRes.data.forEach(shift => {
          marks[shift.date] = {
            marked: true,
            dotColor: shift.status === 'open' ? '#FF7043' : '#9E9E9E',
          };
        });
      }
      setMarkedDates(marks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7043" /></View>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📅 근무 캘린더</Text>
      </View>
      <Calendar
        current={today}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#757575',
          selectedDayBackgroundColor: '#FF7043',
          selectedDayTextColor: '#fff',
          todayTextColor: '#FF7043',
          dayTextColor: '#212121',
          textDisabledColor: '#d9e1e8',
          dotColor: '#FF7043',
          selectedDotColor: '#fff',
          arrowColor: '#FF7043',
          monthTextColor: '#212121',
          textMonthFontWeight: '800',
          textDayFontSize: 14,
        }}
        style={styles.calendar}
      />

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#FF7043' }]} />
          <Text style={styles.legendText}>모집 중</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>확정됨</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#9E9E9E' }]} />
          <Text style={styles.legendText}>마감</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#FF7043', padding: 24, paddingTop: 56 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  calendar: { margin: 16, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, padding: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#757575' },
});
