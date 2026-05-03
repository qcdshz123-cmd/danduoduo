import { act } from '@testing-library/react-native';
import { useAuthStore } from '../../stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    act(() => { useAuthStore.getState().signOut(); });
  });

  describe('initial state', () => {
    it('has null session and user', () => {
      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
    });

    it('has null profile and store', () => {
      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
      expect(state.store).toBeNull();
    });

    it('has isAuthenticated as false', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('setSession', () => {
    it('sets session and user', () => {
      const session = { access_token: 'tok_abc', refresh_token: 'ref_xyz' };
      const user = { id: 'user-1', phone: '13800138000' };

      act(() => { useAuthStore.getState().setSession(session, user); });

      const state = useAuthStore.getState();
      expect(state.session).toEqual(session);
      expect(state.user).toEqual(user);
    });

    it('makes isAuthenticated true', () => {
      act(() => {
        useAuthStore.getState().setSession(
          { access_token: 'tok', refresh_token: 'ref' },
          { id: 'u1', phone: '123' },
        );
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  describe('setProfile', () => {
    it('sets profile and store', () => {
      const profile = {
        id: 'prof-1', store_id: 'store-1', role_id: 'admin' as const,
        display_name: '管理员', avatar_url: null, phone: null,
        is_active: true, permissions: {}, created_at: '', updated_at: '',
      };
      const store = {
        id: 'store-1', name: '测试门店', code: 'ST001',
        address: null, phone: null, metadata: {},
        is_active: true, created_at: '', updated_at: '',
      };

      act(() => { useAuthStore.getState().setProfile(profile, store); });

      const state = useAuthStore.getState();
      expect(state.profile).toEqual(profile);
      expect(state.store).toEqual(store);
    });

    it('derives isAdmin correctly for admin role', () => {
      const adminProfile = {
        id: 'p1', store_id: 's1', role_id: 'admin' as const,
        display_name: 'Admin', avatar_url: null, phone: null,
        is_active: true, permissions: {}, created_at: '', updated_at: '',
      };
      const store = {
        id: 's1', name: 'Store', code: 'ST001',
        address: null, phone: null, metadata: {},
        is_active: true, created_at: '', updated_at: '',
      };

      act(() => { useAuthStore.getState().setProfile(adminProfile, store); });
      expect(useAuthStore.getState().isAdmin).toBe(true);
    });

    it('derives isStaff correctly for staff role', () => {
      const staffProfile = {
        id: 'p2', store_id: 's1', role_id: 'staff' as const,
        display_name: 'Staff', avatar_url: null, phone: null,
        is_active: true, permissions: {}, created_at: '', updated_at: '',
      };
      const store = {
        id: 's1', name: 'Store', code: 'ST001',
        address: null, phone: null, metadata: {},
        is_active: true, created_at: '', updated_at: '',
      };

      act(() => { useAuthStore.getState().setProfile(staffProfile, store); });
      expect(useAuthStore.getState().isAdmin).toBe(false);
      expect(useAuthStore.getState().isStaff).toBe(true);
    });

    it('derives isAdmin and isStaff as false for customer role', () => {
      const customerProfile = {
        id: 'p3', store_id: 's1', role_id: 'customer' as const,
        display_name: 'Customer', avatar_url: null, phone: null,
        is_active: true, permissions: {}, created_at: '', updated_at: '',
      };
      const store = {
        id: 's1', name: 'Store', code: 'ST001',
        address: null, phone: null, metadata: {},
        is_active: true, created_at: '', updated_at: '',
      };

      act(() => { useAuthStore.getState().setProfile(customerProfile, store); });
      expect(useAuthStore.getState().isAdmin).toBe(false);
      expect(useAuthStore.getState().isStaff).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('sets isLoading flag', () => {
      act(() => { useAuthStore.getState().setLoading(true); });
      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => { useAuthStore.getState().setLoading(false); });
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('signOut', () => {
    it('clears all auth state', () => {
      act(() => {
        useAuthStore.getState().setSession(
          { access_token: 'tok', refresh_token: 'ref' },
          { id: 'u1', phone: '123' },
        );
      });
      act(() => { useAuthStore.getState().signOut(); });

      const state = useAuthStore.getState();
      expect(state.session).toBeNull();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.store).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
