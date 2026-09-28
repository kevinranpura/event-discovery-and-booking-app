import { Stack } from 'expo-router';

export default function OrganizerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create-event" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="attendees" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
