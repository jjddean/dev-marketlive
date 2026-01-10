import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const liveUser = useQuery(api.users.current);

  // Mock user data fallback
  const HARDCODED_USER = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    company: 'Global Shipping Inc.',
    role: 'Logistics Manager',
    phone: '+1 (555) 123-4567',
    joinDate: 'March 15, 2022',
    lastLogin: 'November 5, 2023, 9:45 AM',
    timezone: 'Eastern Time (ET)',
    language: 'English',
    twoFactorEnabled: true
  };

  const userData = liveUser ? {
    ...HARDCODED_USER,
    name: liveUser.name,
  } : HARDCODED_USER;

  // Mock notification settings
  const notificationSettings = [
    { id: 'shipment_updates', name: 'Shipment Status Updates', email: true, sms: true, app: true },
    { id: 'document_alerts', name: 'Document Requirements', email: true, sms: false, app: true },
    { id: 'payment_reminders', name: 'Payment Reminders', email: true, sms: true, app: true },
    { id: 'compliance_updates', name: 'Compliance Updates', email: true, sms: false, app: false },
    { id: 'promotional', name: 'Promotional Messages', email: false, sms: false, app: false },
  ];

  // Mock team members
  const teamMembers = [
    { id: 1, name: 'Alex Johnson', email: 'alex.johnson@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Michael Chen', email: 'michael.c@example.com', role: 'User', status: 'Invited' },
  ];

  return (
    <div className="page-container">
      <h1>Account Settings</h1>
      <p className="account-intro">Manage your profile, security, and notification preferences.</p>

      <div className="page-content">
        <div className="account-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            Team Access
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <div className="profile-avatar">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="profile-info">
                <h2>{userData.name}</h2>
                <p>{userData.company} • {userData.role}</p>
                <p>Member since {userData.joinDate}</p>
              </div>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>

            <div className="profile-details">
              <div className="details-card">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{userData.email}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{userData.phone}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Company</div>
                  <div className="detail-value">{userData.company}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">{userData.role}</div>
                </div>
              </div>

              <div className="details-card">
                <h3>Preferences</h3>
                <div className="detail-item">
                  <div className="detail-label">Language</div>
                  <div className="detail-value">
                    {userData.language}
                    <button className="small-edit-btn">Change</button>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Time Zone</div>
                  <div className="detail-value">
                    {userData.timezone}
                    <button className="small-edit-btn">Change</button>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Date Format</div>
                  <div className="detail-value">
                    MM/DD/YYYY
                    <button className="small-edit-btn">Change</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-section">
            <div className="security-card">
              <h3>Account Security</h3>

              <div className="security-item">
                <div className="security-info">
                  <h4>Password</h4>
                  <p>Last changed 45 days ago</p>
                </div>
                <button className="security-action-btn">Change Password</button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>{userData.twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <button className="security-action-btn">
                  {userData.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                </button>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Login History</h4>
                  <p>Last login: {userData.lastLogin}</p>
                </div>
                <button className="security-action-btn">View History</button>
              </div>
            </div>

            <div className="security-card">
              <h3>API Access</h3>
              <p>Manage API keys for integrating with your systems</p>

              <div className="api-keys">
                <div className="api-key-item">
                  <div className="api-key-info">
                    <h4>Production API Key</h4>
                    <p>Created: October 10, 2023</p>
                  </div>
                  <div className="api-key-actions">
                    <button className="view-key-btn">View Key</button>
                    <button className="regenerate-key-btn">Regenerate</button>
                  </div>
                </div>

                <div className="api-key-item">
                  <div className="api-key-info">
                    <h4>Test API Key</h4>
                    <p>Created: October 10, 2023</p>
                  </div>
                  <div className="api-key-actions">
                    <button className="view-key-btn">View Key</button>
                    <button className="regenerate-key-btn">Regenerate</button>
                  </div>
                </div>
              </div>

              <div className="api-documentation">
                <h4>API Documentation</h4>
                <p>Learn how to integrate with our API</p>
                <button className="view-docs-btn">View Documentation</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <div className="notifications-header">
              <h3>Notification Preferences</h3>
              <p>Choose how you want to receive notifications</p>
            </div>

            <div className="notification-channels">
              <div className="channel-header">
                <div className="notification-type">Notification Type</div>
                <div className="channel-options">
                  <div className="channel">Email</div>
                  <div className="channel">SMS</div>
                  <div className="channel">App</div>
                </div>
              </div>

              {notificationSettings.map((setting, index) => (
                <div key={index} className="notification-item">
                  <div className="notification-type">{setting.name}</div>
                  <div className="channel-options">
                    <div className="channel">
                      <input
                        type="checkbox"
                        id={`email-${setting.id}`}
                        checked={setting.email}
                      />
                      <label htmlFor={`email-${setting.id}`}></label>
                    </div>
                    <div className="channel">
                      <input
                        type="checkbox"
                        id={`sms-${setting.id}`}
                        checked={setting.sms}
                      />
                      <label htmlFor={`sms-${setting.id}`}></label>
                    </div>
                    <div className="channel">
                      <input
                        type="checkbox"
                        id={`app-${setting.id}`}
                        checked={setting.app}
                      />
                      <label htmlFor={`app-${setting.id}`}></label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="notification-schedule">
              <h3>Quiet Hours</h3>
              <p>We won't send notifications during these hours</p>

              <div className="time-range">
                <div className="time-input">
                  <label>From:</label>
                  <select className="time-select">
                    <option value="20">8:00 PM</option>
                    <option value="21">9:00 PM</option>
                    <option value="22" selected>10:00 PM</option>
                    <option value="23">11:00 PM</option>
                  </select>
                </div>
                <div className="time-input">
                  <label>To:</label>
                  <select className="time-select">
                    <option value="5">5:00 AM</option>
                    <option value="6" selected>6:00 AM</option>
                    <option value="7">7:00 AM</option>
                    <option value="8">8:00 AM</option>
                  </select>
                </div>
              </div>

              <div className="timezone-note">
                All times are in your local timezone: {userData.timezone}
              </div>
            </div>

            <div className="save-preferences">
              <button className="save-btn">Save Preferences</button>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="team-section">
            <div className="team-header">
              <h3>Team Members</h3>
              <button className="invite-btn">+ Invite Team Member</button>
            </div>

            <div className="team-table-container">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, index) => (
                    <tr key={index}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.role}</td>
                      <td>
                        <span className={`status-badge status-${member.status.toLowerCase()}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit-btn">Edit</button>
                          {member.status === 'Invited' ? (
                            <button className="action-btn resend-btn">Resend</button>
                          ) : (
                            <button className="action-btn remove-btn">Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="role-permissions">
              <h3>Role Permissions</h3>
              <p>Configure what different roles can access</p>

              <div className="role-cards">
                <div className="role-card">
                  <h4>Admin</h4>
                  <p>Full access to all features and settings</p>
                  <ul className="permission-list">
                    <li>Manage team members</li>
                    <li>Access all shipments</li>
                    <li>View and edit billing</li>
                    <li>Generate all reports</li>
                    <li>Manage account settings</li>
                  </ul>
                  <button className="edit-role-btn">Edit Role</button>
                </div>

                <div className="role-card">
                  <h4>User</h4>
                  <p>Limited access to features</p>
                  <ul className="permission-list">
                    <li>View assigned shipments</li>
                    <li>Upload documents</li>
                    <li>Generate basic reports</li>
                    <li>View own profile</li>
                  </ul>
                  <button className="edit-role-btn">Edit Role</button>
                </div>

                <div className="role-card add-role">
                  <div className="add-role-content">
                    <h4>Create Custom Role</h4>
                    <p>Define a new role with custom permissions</p>
                    <button className="add-role-btn">+ Create Role</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;