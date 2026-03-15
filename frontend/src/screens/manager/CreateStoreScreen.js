import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../../api/client';

export default function CreateStoreScreen({ navigation }) {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!storeName.trim()) { Alert.alert('오류', '매장 이름을 입력해주세요.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/stores', { store_name: storeName.trim() });
      Alert.alert('완료 🎉', `매장이 등록되었습니다!\n초대코드: ${res.data.invite_code}\n알바생에게 공유해주세요!`, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← 뒤로</Text></TouchableOpacity>
      <Text style={styles.title}>매장 등록</Text>
      <Text style={styles.sub}>매장을 등록하면 초대코드가 생성됩니다</Text>
      <View style={styles.card}>
        <Text style={styles.label}>매장 이름</Text>
        <TextInput style={styles.input} value={storeName} onChangeText={setStoreName} placeholder="예) 스타벅스 강남점" placeholderTextColor="#C0C0C0" />
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🏪 매장 등록하기</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  inner: { padding: 28, paddingTop: 60 },
  back: { color: '#FF7043', fontSize: 15, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#212121', marginBottom: 6 },
  sub: { fontSize: 14, color: '#9E9E9E', marginBottom: 28 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  label: { fontSize: 13, fontWeight: '600', color: '#757575', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 15, color: '#212121', marginBottom: 20 },
  button: { backgroundColor: '#FF7043', borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
