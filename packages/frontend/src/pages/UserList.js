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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Users</h1>
        <p className="mt-2 text-neutral-600">View and manage system users</p>
      </div>

      <div className="card mb-6 shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
          <div className="flex-1">
            <label className="form-label mb-2 block">Search</label>
            <input
              type="text"
              placeholder="Search by name, username, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="sm:flex-none">
            <label className="form-label mb-2 block">Joined</label>
            <select value={joinedFilter} onChange={(e) => setJoinedFilter(e.target.value)} className="select-field">
              <option value="">All Users</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="older">Earlier</option>
            </select>
          </div>

          <div className="sm:flex-none">
            <label className="form-label mb-2 block">Sort By</label>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="select-field">
              <option value="name">Name</option>
              <option value="username">Username</option>
              <option value="joined">Join Date</option>
            </select>
          </div>

          <button
            onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="btn-ghost border border-neutral-300 px-4 py-2.5 font-semibold"
            title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {filteredUsers.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 py-12 text-center">
          <p className="text-lg text-neutral-600">No users found matching your criteria</p>
          {searchTerm || joinedFilter ? (
            <p className="mt-2 text-neutral-500">Try adjusting your filters</p>
          ) : (
            <p className="mt-2 text-neutral-500">No users in the system yet</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map((user) => (
            <div key={user.id} className="card transition-all hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary-100 text-center font-bold text-primary-700">
                    {user.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {user.firstname} {user.lastname}
                    </h3>
                    <p className="text-sm text-neutral-600">@{user.username}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:text-right">
                  <span className="badge badge-primary w-fit">
                    Joined{' '}
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
