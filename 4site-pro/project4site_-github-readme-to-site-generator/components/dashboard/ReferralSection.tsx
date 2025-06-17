import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { createReferral } from '../../lib/supabase';

interface ReferralSectionProps {
  referrals: any[];
  referralCode: string;
  onUpdate: () => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ 
  referrals, 
  referralCode, 
  onUpdate 
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const referralUrl = `${window.location.origin}?ref=${referralCode}`;
  
  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalRewards = completedReferrals.length * 3; // 3 months per referral

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSending(true);
    setMessage(null);

    try {
      await createReferral(inviteEmail);
      setMessage({ type: 'success', text: 'Invitation sent successfully!' });
      setInviteEmail('');
      onUpdate();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send invitation. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setMessage({ type: 'success', text: 'Referral link copied to clipboard!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Referrals</h3>
            <Icon name="users" size={20} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold">{referrals.length}</p>
          <p className="text-sm text-gray-400 mt-1">
            {completedReferrals.length} active, {pendingReferrals.length} pending
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rewards Earned</h3>
            <Icon name="gift" size={20} className="text-green-400" />
          </div>
          <p className="text-3xl font-bold">{totalRewards}</p>
          <p className="text-sm text-gray-400 mt-1">Months of Pro features</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Success Rate</h3>
            <Icon name="trending-up" size={20} className="text-purple-400" />
          </div>
          <p className="text-3xl font-bold">
            {referrals.length > 0 
              ? `${Math.round((completedReferrals.length / referrals.length) * 100)}%`
              : '0%'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">Conversion rate</p>
        </motion.div>
      </div>

      {/* Share Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Share Your Referral Link</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Your unique referral link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
              />
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Icon name="copy" size={16} />
                <span>Copy</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out 4site.pro - Create amazing websites in seconds! Use my referral link: ${referralUrl}`)}`, '_blank')}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="twitter" size={16} />
              <span>Share on Twitter</span>
            </button>
            
            <button
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`, '_blank')}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <Icon name="linkedin" size={16} />
              <span>Share on LinkedIn</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Email Invite */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Invite by Email</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleInvite} className="flex space-x-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {sending ? (
              <>
                <Icon name="loader-2" size={16} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Icon name="send" size={16} />
                <span>Send Invite</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Referral List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Your Referrals</h3>
        
        {referrals.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No referrals yet. Start inviting friends to earn rewards!
          </p>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">{referral.referred_email}</p>
                  <p className="text-sm text-gray-400">
                    Invited {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  referral.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : referral.status === 'pending'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {referral.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};