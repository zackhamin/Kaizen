# Stream Chat Setup Guide - Brotherhood Forum

## 🚀 **Getting Started with Stream Chat for Brotherhood**

### **Step 1: Get Stream API Key**

1. Go to [Stream Dashboard](https://dashboard.getstream.io/)
2. Create a new app or use existing one
3. Copy your API Key from the dashboard

### **Step 2: Environment Variables**

Add to your `.env` file:
```env
EXPO_PUBLIC_STREAM_API_KEY=your_stream_api_key_here
```

**Note**: For React Native POC with up to 100 users, we use client-side token generation. The API secret is not needed for this approach.

### **Step 3: Stream Dashboard Configuration**

#### **Channels Setup**
The app will automatically create these Brotherhood channels:
- `mental-support` - Mental health support discussions with brothers
- `daily-struggles` - Daily challenges, wins, and accountability
- `goal-accountability` - Progress tracking and motivation

#### **Moderation Setup**
1. Go to Stream Dashboard → Moderation
2. Enable auto-moderation rules
3. Add crisis keywords: `suicide`, `self-harm`, `kill myself`
4. Set up escalation workflows for crisis detection

### **Step 4: Anonymous User Strategy**

The app generates consistent anonymous identities:
- **User ID**: `anon_[hash_of_supabase_id]`
- **Username**: `[Adjective][Noun][Number]` (e.g., "StrongBear427")
- **Avatar**: Random SVG based on user ID

### **Step 4: Viewing Channels in Stream Dashboard**

After running your app and creating channels, you can view them in the Stream Dashboard:

1. **Go to Stream Dashboard**: https://dashboard.getstream.io/
2. **Select your app** from the list
3. **Navigate to "Chat"** in the left sidebar
4. **Click on "Channels"** tab
5. **You'll see your forum channels**:
   - `mental-health`
   - `goals-ambitions`
   - `daily-struggles`
   - `motivation`
   - `relationships`
   - `fitness-health`

**Channel Details You Can See:**
- **Channel ID**: The unique identifier (e.g., `mental-health`)
- **Members**: Users who have joined the channel
- **Messages**: All posts and replies in the channel
- **Created Date**: When the channel was first created
- **Last Activity**: When the last message was sent

**Testing Channels:**
1. **Create a test post** in your app
2. **Refresh the dashboard** to see the new message
3. **Click on a channel** to view all messages
4. **See real-time updates** as users post and reply

**Channel Management:**
- **Delete channels** if needed
- **View channel settings**
- **Monitor user activity**
- **Export channel data**

### **Step 5: Brotherhood Integration**

The Brotherhood card in your Support tab now navigates to the Stream Chat forum instead of the old communities system.

### **Step 6: Testing**

1. **Start the app**
2. **Sign in** with your Supabase account
3. **Go to Support tab** → **Brotherhood card**
4. **Test anonymous posting** in different channels
5. **Test threading** - tap on messages to see replies

## 🔧 **Technical Implementation**

### **Files Created/Updated:**
- `services/stream.service.ts` - Stream Chat service
- `app/forum.tsx` - Brotherhood forum screen with Stream components
- Updated `app/_layout.tsx` - Added forum route
- Updated `components/HomeCards/HomeCardsContainer.tsx` - Brotherhood card now points to forum

### **Key Features:**
- ✅ Anonymous user generation with consistent identities
- ✅ Real-time messaging with threading support
- ✅ Channel management for Brotherhood discussions
- ✅ Glass morphism UI matching your design
- ✅ Crisis keyword detection (via Stream dashboard)
- ✅ Threading support for replies

### **Stream Chat Components Used:**
- `<Chat>` - Root provider
- `<Channel>` - Individual channel wrapper
- `<MessageList>` - Thread-style messages
- `<MessageInput>` - Message composer
- `<Thread>` - Reply threading system

### **Navigation:**
Brotherhood card in Support tab → `/forum` → Stream Chat interface

## 🎯 **Next Steps:**

1. **Add your Stream API key** to `.env`
2. **Test the Brotherhood forum** with anonymous users
3. **Configure moderation** in Stream dashboard
4. **Customize styling** to match your design system

## 📱 **Usage:**

Users can:
- Join anonymous Brotherhood conversations
- Post messages in different channels
- Reply to messages using threading
- See real-time updates
- Maintain consistent anonymous identity

## 🔒 **Security:**

- All users are anonymous
- No real user data exposed
- Consistent identity prevents abuse
- Moderation handled by Stream
- Crisis detection for mental health safety

## 💰 **Pricing:**

- **Free tier**: Up to 100 users
- **Perfect for POC** and initial Brotherhood launch
- **Scale up** as needed

## 🧠 **Mental Health Focus:**

- **Safe space** messaging
- **Crisis detection** via Stream moderation
- **Supportive environment** for men's mental health
- **Anonymous** to reduce barriers

---

**Ready to test! Add your Stream API key and launch the Brotherhood forum.** 