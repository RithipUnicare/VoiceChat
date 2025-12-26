import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Text,
  Avatar,
  List,
  Divider,
  TouchableRipple,
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList, UserUpdateRequest } from '../../types/types';
import { userService } from '../../services/userService';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData: UserUpdateRequest = {
        name: formData.name,
        email: formData.email,
      };
      await userService.updateProfile(updateData);
      await refreshUser();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Avatar.Icon
          size={120}
          icon="account"
          style={styles.avatarContainer}
          color="#fff"
        />
        <Text variant="titleMedium" style={styles.role}>
          {user.role}
        </Text>
      </View>

      <Card style={styles.section}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Personal Information
            </Text>
            {!isEditing && (
              <TouchableRipple
                onPress={() => setIsEditing(true)}
                style={{ borderRadius: 20 }}
              >
                <List.Icon icon="pencil" color="#6200ee" />
              </TouchableRipple>
            )}{' '}
          </View>

          {isEditing ? (
            <>
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.editButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      email: user.email,
                    });
                  }}
                  style={styles.cancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleUpdateProfile}
                  loading={loading}
                  style={styles.saveButton}
                />
              </View>
            </>
          ) : (
            <>
              <List.Item
                title="Name"
                description={user.name}
                left={props => <List.Icon {...props} icon="account" />}
              />
              <Divider />
              <List.Item
                title="Email"
                description={user.email}
                left={props => <List.Icon {...props} icon="email" />}
              />
              <Divider />
              <List.Item
                title="Mobile Number"
                description={user.mobileNumber}
                left={props => <List.Icon {...props} icon="phone" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#6200ee',
    paddingVertical: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  role: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  logoutButton: {
    borderColor: '#f44336',
  },
});

export default ProfileScreen;
