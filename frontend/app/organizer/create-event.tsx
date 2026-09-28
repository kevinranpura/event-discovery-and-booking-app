import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEventsStore } from '../../store/eventsStore';
import { eventsService } from '../../services/eventsService';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { COLORS, CATEGORIES } from '../../constants';

interface FormData {
  name: string; description: string; category: string; image: string;
  date: string; start_time: string; end_time: string; venue: string;
  address: string; ticket_price: string; total_seats: string;
}

const initialForm: FormData = {
  name: '', description: '', category: 'Music', image: '',
  date: '', start_time: '', end_time: '', venue: '',
  address: '', ticket_price: '', total_seats: '',
};

export default function CreateEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const { createEvent, updateEvent, isLoading } = useEventsStore();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (eventId) { setIsEditing(true); loadEvent(parseInt(eventId)); }
  }, [eventId]);

  const loadEvent = async (id: number) => {
    try {
      const res = await eventsService.getEvent(id);
      const ev = res.data.event;
      setForm({ name: ev.name || '', description: ev.description || '', category: ev.category || 'Music', image: ev.image || '', date: ev.date?.split('T')[0] || '', start_time: ev.start_time || '', end_time: ev.end_time || '', venue: ev.venue || '', address: ev.address || '', ticket_price: String(ev.ticket_price || '0'), total_seats: String(ev.total_seats || '') });
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  const update = (key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = 'Event name is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (!form.start_time) newErrors.start_time = 'Start time is required';
    if (!form.venue.trim()) newErrors.venue = 'Venue is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.ticket_price) newErrors.ticket_price = 'Price is required';
    else if (isNaN(parseFloat(form.ticket_price)) || parseFloat(form.ticket_price) < 0) newErrors.ticket_price = 'Enter a valid price (0 for free)';
    if (!form.total_seats) newErrors.total_seats = 'Total seats is required';
    else if (parseInt(form.total_seats) < 1) newErrors.total_seats = 'Minimum 1 seat';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { ...form, ticket_price: parseFloat(form.ticket_price), total_seats: parseInt(form.total_seats) };
      if (isEditing && eventId) { await updateEvent(parseInt(eventId), payload); Alert.alert('Success', 'Event updated successfully!', [{ text: 'OK', onPress: () => router.back() }]); }
      else { await createEvent(payload); Alert.alert('Success', 'Event created successfully!', [{ text: 'OK', onPress: () => router.back() }]); }
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Event' : 'Create Event'}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.groupTitle}>Basic Information</Text>
          <InputField label="Event Name *" value={form.name} onChangeText={(v) => update('name', v)} placeholder="Enter event name" leftIcon="musical-notes-outline" error={errors.name} />
          <InputField label="Description *" value={form.description} onChangeText={(v) => update('description', v)} placeholder="Describe your event..." leftIcon="document-text-outline" error={errors.description} multiline numberOfLines={4} />
          <InputField label="Cover Image URL" value={form.image} onChangeText={(v) => update('image', v)} placeholder="https://..." leftIcon="image-outline" keyboardType="url" />

          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.slice(1).map((cat) => {
              const isSelected = form.category === cat.name;
              return (
                <TouchableOpacity key={cat.id} onPress={() => update('category', cat.name)} style={[styles.catChip, isSelected && styles.catChipActive]}>
                  <Ionicons name={cat.iconName as any} size={15} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                  <Text style={[styles.catText, isSelected && styles.catTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.groupTitle, { marginTop: 16 }]}>Date & Time</Text>
          <InputField label="Date * (YYYY-MM-DD)" value={form.date} onChangeText={(v) => update('date', v)} placeholder="2026-12-31" leftIcon="calendar-outline" error={errors.date} keyboardType="numbers-and-punctuation" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField label="Start Time * (HH:MM)" value={form.start_time} onChangeText={(v) => update('start_time', v)} placeholder="18:00" leftIcon="time-outline" error={errors.start_time} keyboardType="numbers-and-punctuation" />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="End Time (HH:MM)" value={form.end_time} onChangeText={(v) => update('end_time', v)} placeholder="22:00" leftIcon="time-outline" keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          <Text style={[styles.groupTitle, { marginTop: 8 }]}>Location</Text>
          <InputField label="Venue Name *" value={form.venue} onChangeText={(v) => update('venue', v)} placeholder="Jio World Convention Centre" leftIcon="business-outline" error={errors.venue} />
          <InputField label="Full Address *" value={form.address} onChangeText={(v) => update('address', v)} placeholder="Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051" leftIcon="location-outline" error={errors.address} />

          <Text style={[styles.groupTitle, { marginTop: 8 }]}>Tickets</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField label="Price (₹) *" value={form.ticket_price} onChangeText={(v) => update('ticket_price', v)} placeholder="0 for free" leftIcon="card-outline" keyboardType="decimal-pad" error={errors.ticket_price} />
            </View>
            <View style={{ flex: 1 }}>
              <InputField label="Total Seats *" value={form.total_seats} onChangeText={(v) => update('total_seats', v)} placeholder="500" leftIcon="people-outline" keyboardType="number-pad" error={errors.total_seats} />
            </View>
          </View>

          <PrimaryButton
            title={isEditing ? 'Update Event' : 'Create Event'}
            onPress={handleSubmit}
            isLoading={isLoading}
            size="lg"
            style={{ marginTop: 8 }}
            icon={<Ionicons name={isEditing ? 'save-outline' : 'add-circle-outline'} size={18} color={COLORS.white} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  groupTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 14, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500', marginBottom: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  catEmoji: { fontSize: 14 },
  catText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  catTextActive: { color: COLORS.primary, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
});
