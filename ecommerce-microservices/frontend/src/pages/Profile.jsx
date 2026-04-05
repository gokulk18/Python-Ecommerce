import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { updateProfile } from '../api/userApi';
import { getNotifications } from '../api/notificationApi';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.id) {
       getNotifications(user.id).then(setNotifications).catch(console.error);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateProfile({ name });
      setUser(updatedUser);
      setToast('Profile updated successfully');
    } catch (err) {
      setToast('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toast.includes('success') ? 'success' : 'error'} />}
      
      <Card className="p-8 h-fit">
        <h2 className="text-2xl font-sora font-semibold text-white mb-6">Profile Settings</h2>
        <form onSubmit={handleUpdate} className="space-y-6">
          <Input 
            label="Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <Input 
            label="Email" 
            value={user.email} 
            disabled 
            className="opacity-50 cursor-not-allowed" 
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update Profile'}
          </Button>
        </form>
      </Card>

      <Card className="p-8">
        <h2 className="text-2xl font-sora font-semibold text-white mb-6">Recent Notifications</h2>
         {notifications.length === 0 ? (
           <p className="text-gray-400">No recent notifications.</p>
         ) : (
           <ul className="space-y-4">
             {notifications.map(notif => (
               <li key={notif.id} className="border-l-2 border-nexus-secondary pl-3 pb-2 text-sm">
                 <p className="text-gray-300">{notif.message}</p>
                 <span className="text-gray-500 text-xs mt-1">{new Date(notif.created_at).toLocaleString()}</span>
               </li>
             ))}
           </ul>
         )}
      </Card>
    </div>
  );
};

export default Profile;
