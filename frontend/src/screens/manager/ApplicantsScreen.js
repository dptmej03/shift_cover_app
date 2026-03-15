import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../api/client';

const STATUS_COLOR = { pending: '#FF9800', accepted: '#4CAF50', rejected: '#F44336' };
const STATUS_LABEL = { pending: '대기중', accepted: '✅ 승인됨', rejected: '❌ 거절됨' };

export default function ApplicantsScreen({ route, navigation }) {
  const { shiftId, shift } = route.params;
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/shift/${shiftId}`);
      setApplicants(res.data);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (appId, status) => {
    const label = status === 'accepted' ? '승인' : '거절';
    Alert.alert(`${label} 확인`, `이 알바생의 신청을 ${label}하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: label,
        style: status === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            await api.patch(`/applications/${appId}`, { status });
            fetchApplicants();
            if (status === 'accepted') Alert.alert('완료', '대타가 확정되었습니다! 🎉');
          } catch (e) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7043" /></View>;

  return (
    <View style={styles.container}>
      {/* 상단 요청 정보 */}
      <View style={styles.shiftInfo}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.shiftDate}>{shift.date}</Text>
        <Text style={styles.shiftTime}>🕐 {shift.start_time} ~ {shift.end_time}</Text>
      </View>

      <Text style={styles.sectionTitle}>신청자 목록 ({applicants.length}명)</Text>

      {applicants.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🙋</Text>
          <Text style={styles.emptyText}>아직 신청자가 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={applicants}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.employeeName}>👤 {item.employee_name || '알바생'}</Text>
                  {item.memo ? (
                    <View style={styles.memoBox}>
                      <Text style={styles.memoText}>“{item.memo}”</Text>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                    {STATUS_LABEL[item.status]}
                  </Text>
                </View>
              </View>
              {item.status === 'pending' && (
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleDecision(item.id, 'accepted')}
                  >
                    <Text style={styles.acceptBtnText}>✅ 승인</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleDecision(item.id, 'rejected')}
                  >
                    <Text style={styles.rejectBtnText}>❌ 거절</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shiftInfo: { backgroundColor: '#FF7043', padding: 24, paddingTop: 56 },
  back: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 10 },
  shiftDate: { color: '#fff', fontSize: 26, fontWeight: '800' },
  shiftTime: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#212121', padding: 16, paddingBottom: 4 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: '#9E9E9E' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  employeeName: { fontSize: 16, fontWeight: '700', color: '#212121' },
  memoBox: { marginTop: 4, paddingHorizontal: 4 },
  memoText: { fontSize: 13, color: '#FF7043', fontStyle: 'italic', fontWeight: '500' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#E8F5E9' },
  acceptBtnText: { color: '#4CAF50', fontWeight: '700' },
  rejectBtn: { backgroundColor: '#FFEBEE' },
  rejectBtnText: { color: '#F44336', fontWeight: '700' },
});
