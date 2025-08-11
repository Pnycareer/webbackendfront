import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import useAuth from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo or Brand Name */}
        <div className="text-xl font-semibold text-gray-800 cursor-pointer">
          PNY Trainings Dashboard
        </div>

        {/* Profile Dropdown */}
        <Menu as="div" className="relative">
          <MenuButton>
            <img
              className="h-9 w-9 rounded-full object-cover border border-gray-300"
              src="https://media.istockphoto.com/id/1208175274/vector/avatar-vector-icon-simple-element-illustrationavatar-vector-icon-material-concept-vector.jpg?s=612x612&w=0&k=20&c=t4aK_TKnYaGQcPAC5Zyh46qqAtuoPcb-mjtQax3_9Xc="
              alt="User avatar"
            />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-2 px-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
              <span className="text-xs text-indigo-600 font-medium">{user?.role?.toUpperCase()}</span>
            </div>

            <div className="py-1">
              {/* <MenuItem>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    My Profile
                  </a>
                )}
              </MenuItem> */}
              {/* <MenuItem>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    Settings
                  </a>
                )}
              </MenuItem> */}
              <MenuItem>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      active ? 'bg-red-100 text-red-800' : 'text-red-600'
                    }`}
                  >
                    Logout
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      </div>
    </header>
  );
}
