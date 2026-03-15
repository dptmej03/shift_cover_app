import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const STATUS_COLOR = { open: '#4CAF50', closed: '#9E9E9E' };
const STATUS_LABEL = { open: '신청 가능', closed: '마감' };

export default function EmployeeHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [storeRes, shiftsRes] = await Promise.all([
        api.get('/stores/mine'),
        api.get('/shifts'),
      ]);
      setStore(storeRes.data);
      setShifts(shiftsRes.data);
    } catch (e) {
      if (e.message.includes('소속된 매장')) setStore(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7043" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요, {user?.name}님 👋</Text>
          <Text style={styles.storeName}>{store ? `☕ ${store.store_name}` : '매장 미참여'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      {!store ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>🏪</Text>
          <Text style={styles.emptyTitle}>매장에 먼저 참여해주세요</Text>
          <Text style={styles.emptySub}>사장님께 초대코드를 받아 참여하세요</Text>
          <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate('JoinStore')}>
            <Text style={styles.joinBtnText}>+ 매장 참여하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 대타 요청 목록</Text>
          </View>
          {shifts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>현재 대타 요청이 없어요</Text>
            </View>
          ) : (
            <FlatList
              data={shifts}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={['#FF7043']} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.card, item.status === 'closed' && styles.cardClosed]}
                  onPress={() => navigation.navigate('ShiftDetail', { shiftId: item.id, shift: item })}
                >
                  <View style={styles.cardTop}>
                    <Text style={styles.cardDate}>{item.date}</Text>
                    <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                      <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardTime}>🕐 {item.start_time} ~ {item.end_time}</Text>
                  {item.status === 'open' && (
                    <Text style={styles.tapHint}>탭하여 신청하기 →</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#FF7043', padding: 24, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 2 },
  storeName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#212121' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardClosed: { opacity: 0.6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 17, fontWeight: '800', color: '#212121' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardTime: { fontSize: 14, color: '#757575', marginBottom: 2 },
  tapHint: { fontSize: 12, color: '#FF7043', fontWeight: '600', marginTop: 6 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#424242', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#9E9E9E', marginTop: 6, textAlign: 'center' },
  joinBtn: { backgroundColor: '#FF7043', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
