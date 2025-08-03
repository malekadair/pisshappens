# PissHappens 💩 - Bathroom Humor Comics

A humor-based web application for browsing and enjoying bathroom-themed comics with three unique viewing modes!

## 🎯 Features

- **Three Viewing Modes:**
  - 🚹 **Urinal Mode**: Quick viewing - see the full comic at once
  - 🚪 **Stall Mode**: Take your time - frame by frame navigation
  - ♿ **Accessible Mode**: Sit back and relax - auto-play slideshow

- **User Features:**
  - Browse comics without authentication
  - Create account to favorite comics
  - User profile with saved favorites
  - Search comics by title and tags

- **Admin Features:**
  - Secure admin dashboard
  - Upload comic images with metadata
  - Manage comic titles, frame counts, and tags

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Authentication**: Supabase Auth (email/password)
- **Storage**: Supabase Storage for comic images
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pisshappens
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy and execute the contents of supabase-schema.sql in Supabase SQL Editor
```

This will create:
- `users` table with role-based access
- `comics` table for comic metadata  
- `favorites` table for user favorites
- Row Level Security policies
- Storage bucket for comic images
- Triggers for user creation

### 4. Create Admin User

1. Sign up through the app first
2. In Supabase SQL Editor, promote your user to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Authentication pages
│   ├── admin/upload/          # Admin dashboard
│   ├── comic/[id]/           # Comic viewer with modes
│   ├── profile/              # User profile & favorites
│   └── browse/               # Comic browsing page
├── components/
│   ├── ui/                   # Reusable UI components
│   ├── comics/               # Comic-specific components
│   └── Navigation.tsx        # Main navigation
├── contexts/
│   └── AuthContext.tsx       # Authentication context
├── lib/
│   ├── supabase.ts          # Supabase client config
│   ├── database.types.ts    # TypeScript types
│   └── utils.ts             # Utility functions
└── middleware.ts             # Route protection
```

## 🔐 Authentication & Authorization

- **Public**: Browse comics without login
- **Users**: Create account, favorite comics, view profile
- **Admins**: Upload and manage comics via `/admin/upload`

Route protection is handled by Next.js middleware with Supabase auth.

## 🎨 Comic Viewing Modes

### Urinal Mode 🚹
- Full comic display
- Quick viewing experience
- Perfect for short comics

### Stall Mode 🚪  
- Frame-by-frame navigation
- Previous/Next controls
- Take your time viewing

### Accessible Mode ♿
- Auto-play slideshow
- Configurable timing
- Play/pause controls

## 🗃️ Database Schema

### Users
- `id`: UUID (references auth.users)
- `email`: User email
- `role`: 'user' | 'admin'
- `created_at`: Timestamp

### Comics  
- `id`: UUID
- `title`: Comic title
- `image_url`: Supabase storage URL
- `creator_id`: References users.id
- `frame_count`: Number of frames
- `tags`: String array
- `created_at`: Timestamp

### Favorites
- `user_id`: References users.id  
- `comic_id`: References comics.id
- `created_at`: Timestamp

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with 💩 and ❤️ for bathroom humor enthusiasts everywhere!
