import { render } from '@testing-library/react-native';
import React from 'react';
import { Animated } from 'react-native';
import PostCard from './PostCard';

describe('PostCard', () => {
  it('renders post content', () => {
    const post = {
      id: '1',
      title: 'Test Title',
      content: 'Hello world!',
      author: 'anon',
      community: { name: 'test', category: 'general', slug: 'test' },
      votes: { upvotes: 5, downvotes: 2, userVote: null },
      commentCount: 3,
      timeAgo: '1h',
      isPrivate: false,
    };
    const fadeAnim = new Animated.Value(1);
    const categoryStyle = { bg: '#fff', text: '#000', emoji: '💬' };
    const netVotes = 3;
    const { getByText } = render(
      <PostCard
        post={post}
        fadeAnim={fadeAnim}
        categoryStyle={categoryStyle}
        netVotes={netVotes}
        onPress={jest.fn()}
        onVote={jest.fn()}
      />
    );
    expect(getByText('Hello world!')).toBeTruthy();
    expect(getByText('Test Title')).toBeTruthy();
  });
}); 