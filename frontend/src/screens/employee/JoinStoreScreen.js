import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import api from '../../api/client';

export default function JoinStoreScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) { Alert.alert('오류', '초대코드를 입력해주세요.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/stores/join', { invite_code: code.trim().toUpperCase() });
      Alert.alert('완료 🎉', `${res.data.store_name}에 참여했습니다!`, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← 뒤로</Text></TouchableOpacity>
      <Text style={styles.title}>매장 참여</Text>
      <Text style={styles.sub}>사장님께 받은 6자리 초대코드를 입력하세요</Text>
      <View style={styles.card}>
        <Text style={styles.label}>초대 코드</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="예) ABCD12"
          placeholderTextColor="#C0C0C0"
          autoCapitalize="characters"
          maxLength={6}
        />
        <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🚀 참여하기</Text>}
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
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, fontSize: 24, fontWeight: '800', color: '#FF7043', textAlign: 'center', letterSpacing: 6, marginBottom: 20 },
  button: { backgroundColor: '#FF7043', borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
