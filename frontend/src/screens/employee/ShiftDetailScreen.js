import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, TextInput,
} from 'react-native';
import api from '../../api/client';

const STATUS_COLOR = { pending: '#FF9800', accepted: '#4CAF50', rejected: '#F44336' };
const STATUS_LABEL = { pending: '⏳ 검토중', accepted: '✅ 확정', rejected: '❌ 거절됨' };

export default function ShiftDetailScreen({ route, navigation }) {
  const { shiftId, shift } = route.params;
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [memo, setMemo] = useState('');

  useEffect(() => { checkMyApplication(); }, []);

  const checkMyApplication = async () => {
    try {
      const res = await api.get('/applications/my');
      setMyApps(res.data.filter(a => a.request_id === shiftId));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    Alert.alert('대타 신청', `${shift.date} ${shift.start_time}~${shift.end_time} 신청할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '신청하기', onPress: async () => {
          setApplying(true);
          try {
            await api.post('/applications', { request_id: shiftId, memo: memo.trim() });
            Alert.alert('완료', '신청이 완료되었습니다! 🎉');
            checkMyApplication();
          } catch (e) {
            Alert.alert('오류', e.message);
          } finally {
            setApplying(false);
          }
        },
      },
    ]);
  };

  const myApp = myApps[0];
  const alreadyApplied = !!myApp;

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7043" /></View>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroCard}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.heroLabel}>대타 요청 상세</Text>
        <Text style={styles.heroDate}>{shift.date}</Text>
        <Text style={styles.heroTime}>🕐 {shift.start_time} ~ {shift.end_time}</Text>
        <View style={[styles.statusBadge, { backgroundColor: shift.status === 'open' ? '#4CAF5033' : '#9E9E9E33' }]}>
          <Text style={[styles.statusText, { color: shift.status === 'open' ? '#4CAF50' : '#9E9E9E' }]}>
            {shift.status === 'open' ? '신청 가능' : '마감'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {alreadyApplied ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>내 신청 현황</Text>
            <View style={[styles.statusRow, { backgroundColor: STATUS_COLOR[myApp.status] + '22' }]}>
              <Text style={[styles.statusBig, { color: STATUS_COLOR[myApp.status] }]}>
                {STATUS_LABEL[myApp.status]}
              </Text>
            </View>
            {myApp.memo ? (
              <View style={styles.myMemoBox}>
                <Text style={styles.myMemoLabel}>보낸 메시지:</Text>
                <Text style={styles.myMemoText}>{myApp.memo}</Text>
              </View>
            ) : null}
            {myApp.status === 'pending' && (
              <Text style={styles.pendingNote}>사장님이 검토 중입니다. 잠시 기다려주세요 😊</Text>
            )}
          </View>
        ) : shift.status === 'open' ? (
          <>
            <View style={styles.memoInputCard}>
              <Text style={styles.memoInputLabel}>사장님께 남길 메모 (선택)</Text>
              <TextInput
                style={styles.memoInput}
                placeholder="예) 보건증 보관 중입니다!, 10분 일찍 갈 수 있어요."
                placeholderTextColor="#C0C0C0"
                value={memo}
                onChangeText={setMemo}
                multiline
              />
            </View>
            <TouchableOpacity
              style={[styles.applyBtn, applying && { opacity: 0.6 }]}
              onPress={handleApply}
              disabled={applying}
            >
              {applying
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.applyBtnText}>🙋 대타 신청하기</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.closedNote}>
            <Text style={styles.closedNoteText}>이미 마감된 요청입니다</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroCard: { backgroundColor: '#FF7043', padding: 28, paddingTop: 56 },
  back: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 16 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 },
  heroDate: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 6 },
  heroTime: { color: 'rgba(255,255,255,0.9)', fontSize: 18, marginBottom: 14 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { fontWeight: '700', fontSize: 13 },
  body: { padding: 24 },
  applyBtn: { backgroundColor: '#FF7043', borderRadius: 18, padding: 20, alignItems: 'center', elevation: 4, shadowColor: '#FF7043', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  applyBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  memoInputCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#FF7043', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  memoInputLabel: { fontSize: 13, fontWeight: '700', color: '#FF7043', marginBottom: 8 },
  memoInput: { minHeight: 60, fontSize: 14, color: '#212121', textAlignVertical: 'top' },
  myMemoBox: { marginTop: 12, padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8 },
  myMemoLabel: { fontSize: 11, color: '#9E9E9E', marginBottom: 2 },
  myMemoText: { fontSize: 13, color: '#424242' },
  resultCard: { backgroundColor: '#fff', borderRadius: 18, padding: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  resultTitle: { fontSize: 14, fontWeight: '600', color: '#9E9E9E', marginBottom: 12 },
  statusRow: { borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  statusBig: { fontSize: 22, fontWeight: '800' },
  pendingNote: { color: '#9E9E9E', fontSize: 13, textAlign: 'center' },
  closedNote: { backgroundColor: '#F5F5F5', borderRadius: 14, padding: 20, alignItems: 'center' },
  closedNoteText: { color: '#9E9E9E', fontSize: 15, fontWeight: '600' },
});
