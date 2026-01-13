import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getUsers } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinedFilter, setJoinedFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        const processedUsers = data.map((user) => ({
          ...user,
          searchableText: `${user.firstname.toLowerCase()} ${user.lastname.toLowerCase()} ${user.username.toLowerCase()}`,
          joinedDate: new Date(user.created_at),
          joinedCategory: (() => {
            const created = new Date(user.created_at);
            const now = new Date();
            const diffTime = Math.abs(now - created);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays < 7 ? 'new' : diffDays < 30 ? 'recent' : 'old';
          })(),
          fullName: `${user.firstname} ${user.lastname}`,
          initials: `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`
        }));
        setUsers(processedUsers);
      } catch (err) {
        setError('Failed to load users');
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

  const searchUsers = useCallback((user, term) => {
    if (!term) return true;

    const searchWords = term.toLowerCase().split(' ');

    const searchFields = [
      user.searchableText,
      user.fullName.toLowerCase(),
      user.initials.toLowerCase(),
      new Date(user.created_at).toLocaleDateString()
    ];

    return searchWords.every((word) => {
      const searchOptions = searchFields.map((field) => ({
        field,
        weight: field === user.searchableText ? 2 : 1
      }));

      return searchOptions.some((option) => {
        const words = option.field.split(' ');
        return words.some((fieldWord) => {
          const normalizedFieldWord = fieldWord.trim().toLowerCase();
          const normalizedSearchWord = word.trim().toLowerCase();

          if (normalizedFieldWord.includes(normalizedSearchWord)) {
            return true * option.weight;
          }

          const matrix = Array(normalizedFieldWord.length + 1)
            .fill(null)
            .map(() => Array(normalizedSearchWord.length + 1).fill(null));

          for (let i = 0; i <= normalizedFieldWord.length; i++) {
            matrix[i][0] = i;
          }
          for (let j = 0; j <= normalizedSearchWord.length; j++) {
            matrix[0][j] = j;
          }

          for (let i = 1; i <= normalizedFieldWord.length; i++) {
            for (let j = 1; j <= normalizedSearchWord.length; j++) {
              const cost = normalizedFieldWord[i - 1] === normalizedSearchWord[j - 1] ? 0 : 1;
              matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
            }
          }

          const maxLength = Math.max(normalizedFieldWord.length, normalizedSearchWord.length);
          const threshold = Math.floor(maxLength * 0.3);
          return matrix[normalizedFieldWord.length][normalizedSearchWord.length] <= threshold;
        });
      });
    });
  }, []);

  const sortUsers = useCallback(
    (a, b) => {
      let compareValueA, compareValueB;

      switch (sortField) {
        case 'name':
          compareValueA = `${a.firstname}${a.lastname}`.toLowerCase();
          compareValueB = `${b.firstname}${b.lastname}`.toLowerCase();
          break;
        case 'username':
          compareValueA = a.username.toLowerCase();
          compareValueB = b.username.toLowerCase();
          break;
        case 'joined':
          compareValueA = new Date(a.created_at).getTime();
          compareValueB = new Date(b.created_at).getTime();
          break;
        default:
          compareValueA = a[sortField];
          compareValueB = b[sortField];
      }

      if (sortDirection === 'asc') {
        return compareValueA < compareValueB ? -1 : compareValueA > compareValueB ? 1 : 0;
      } else {
        return compareValueB < compareValueA ? -1 : compareValueB > compareValueA ? 1 : 0;
      }
    },
    [sortField, sortDirection]
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchMatch = searchUsers(user, searchTerm);

        let joinedMatch = true;
        if (joinedFilter) {
          const now = new Date();
          const userDate = new Date(user.created_at);
          const diffTime = Math.abs(now - userDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (joinedFilter) {
            case 'week':
              joinedMatch = diffDays <= 7 && user.joinedCategory === 'new';
              break;
            case 'month':
              joinedMatch = diffDays <= 30 && user.joinedCategory === 'recent';
              break;
            case 'older':
              joinedMatch = diffDays > 30 && user.joinedCategory === 'old';
              break;
            default:
              joinedMatch = true;
          }
        }

        return searchMatch && joinedMatch;
      })
      .sort(sortUsers);
  }, [users, searchTerm, joinedFilter, searchUsers, sortUsers]);

  return (
    <div className="p-5">
      <h2 className="mb-5 text-2xl font-bold">Users</h2>

      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        />

        <select
          value={joinedFilter}
          onChange={(e) => setJoinedFilter(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        >
          <option value="">All Users</option>
          <option value="week">Joined this week</option>
          <option value="month">Joined this month</option>
          <option value="older">Joined earlier</option>
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:border-green-500"
        >
          <option value="name">Sort by Name</option>
          <option value="username">Sort by Username</option>
          <option value="joined">Sort by Join Date</option>
        </select>

        <button
          onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition"
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {error && <div className="text-red-600 p-2 bg-red-100 rounded mb-5">{error}</div>}

      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="border border-gray-300 rounded-lg p-3 bg-white flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <h3 className="m-0 mb-1 font-bold">
                {user.firstname} {user.lastname}
              </h3>
              <p className="m-0 text-gray-600">@{user.username}</p>
            </div>
            <div className="bg-blue-100 px-2 py-1 rounded text-sm">
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && <p className="text-center text-gray-600">No users found matching your criteria</p>}
    </div>
  );
};

export default UserList;
