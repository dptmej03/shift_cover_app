import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
  Platform,
} from 'react-native';
import api from '../../api/client';

export default function CreateShiftScreen({ navigation }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !startTime || !endTime) {
      Alert.alert('오류', '날짜와 시간을 모두 입력해주세요.');
      return;
    }
    // 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(date)) { Alert.alert('오류', '날짜 형식: YYYY-MM-DD'); return; }
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) { Alert.alert('오류', '시간 형식: HH:MM'); return; }

    setLoading(true);
    try {
      await api.post('/shifts', { date, start_time: startTime, end_time: endTime });
      Alert.alert('완료', '대타 요청이 등록되었습니다!', [{ text: '확인', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>대타 요청 만들기</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldIcon}>📅</Text>
          <View style={styles.fieldContent}>
            <Text style={styles.label}>날짜</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD  예) 2024-03-20"
              placeholderTextColor="#C0C0C0"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldIcon}>🕐</Text>
          <View style={styles.fieldContent}>
            <Text style={styles.label}>시작 시간</Text>
            <TextInput
              style={styles.input}
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM  예) 18:00"
              placeholderTextColor="#C0C0C0"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldIcon}>🕗</Text>
          <View style={styles.fieldContent}>
            <Text style={styles.label}>종료 시간</Text>
            <TextInput
              style={styles.input}
              value={endTime}
              onChangeText={setEndTime}
              placeholder="HH:MM  예) 22:00"
              placeholderTextColor="#C0C0C0"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
          </View>
        </View>
      </View>

      {/* 미리보기 */}
      {date && startTime && endTime && (
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>📋 요청 미리보기</Text>
          <Text style={styles.previewText}>{date}  {startTime} ~ {endTime}</Text>
        </View>
      )}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>요청 등록하기</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  inner: { padding: 24, paddingTop: 60 },
  headerRow: { marginBottom: 24 },
  back: { color: '#FF7043', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#212121' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  fieldGroup: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  fieldIcon: { fontSize: 24, marginTop: 4 },
  fieldContent: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#9E9E9E', marginBottom: 6 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 13, fontSize: 15, color: '#212121' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },
  preview: { marginTop: 20, backgroundColor: '#FFF3EF', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FF7043' },
  previewLabel: { fontSize: 12, fontWeight: '700', color: '#FF7043', marginBottom: 6 },
  previewText: { fontSize: 16, fontWeight: '800', color: '#212121' },
  button: { backgroundColor: '#FF7043', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 28 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
