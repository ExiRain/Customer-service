import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '../../../../utils/test.utils';
import ChatKeypad from './chat-keypad';
import ChatService from '../../../../services/chat.service';
import { MessageModel } from '../../../../model/message.model';
import { AUTHOR_ROLES, CHAT_STATUS, CHAT_TABS } from '../../../../utils/constants';
import { Chat } from '../../../../model/chat.model';
import chatsReducer, { ChatsState } from '../../../../slices/chats.slice';
import authenticationReducer, { AuthenticationState } from '../../../../slices/authentication.slice';
import { initialAuthenticationState, initialChatsState, initialSingleChatState } from '../../../../test-cs-initial-states';

const chat: Chat = { ...initialSingleChatState, lastMessage: 'mingi sõnum', customerSupportId: 'EE60001019906' };
const chatsState: ChatsState = { ...initialChatsState, activeChats: [chat], selectedChatId: '1', activeTab: CHAT_TABS.TAB_ANSWERED };
const authenticationState: AuthenticationState = { ...initialAuthenticationState, userLogin: 'name', customerSupportId: 'EE60001019906' };

const testStore = configureStore({
  reducer: {
    chats: chatsReducer,
    authentication: authenticationReducer,
  },
  preloadedState: {
    chats: chatsState,
    authentication: authenticationState,
  },
});

describe('Keypad component', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render Keypad', () => {
    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );
    screen.getByRole('button');
    screen.getByRole('textbox');
  });

  it('should not send new message containing only spaces', () => {
    ChatService.sendMessage = jest.fn(() => Promise.resolve({ id: '123', status: CHAT_STATUS.ENDED, created: '', updated: '', ended: '', lastMessage: '' }));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2000-01-01T00:00:00.000Z');

    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );

    const textArea = screen.getByRole('textbox');

    fireEvent.change(textArea, { target: { value: '    ' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(ChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('should not send new message containing only newlines', () => {
    ChatService.sendMessage = jest.fn(() => Promise.resolve({ id: '123', status: CHAT_STATUS.ENDED, created: '', updated: '', ended: '', lastMessage: '' }));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2000-01-01T00:00:00.000Z');

    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );

    const textArea = screen.getByRole('textbox');

    fireEvent.change(textArea, { target: { value: '\n\n\n\n\n' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(ChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('should not send new message containing only spaces or newlines', () => {
    ChatService.sendMessage = jest.fn(() => Promise.resolve({ id: '123', status: CHAT_STATUS.ENDED, created: '', updated: '', ended: '', lastMessage: '' }));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2000-01-01T00:00:00.000Z');

    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );

    const textArea = screen.getByRole('textbox');

    fireEvent.change(textArea, { target: { value: '  \n\n   \n\n \n    ' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(ChatService.sendMessage).not.toHaveBeenCalled();
  });

  it('should remove excessive newlines', () => {
    ChatService.sendMessage = jest.fn(() => Promise.resolve({ id: '123', status: CHAT_STATUS.ENDED, created: '', updated: '', ended: '', lastMessage: '' }));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2000-01-01T00:00:00.000Z');

    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );

    const textArea = screen.getByRole('textbox');

    fireEvent.change(textArea, { target: { value: '  tekst\n\n\n   \n\n \n    tekst' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });

    const expectedRequestBody: MessageModel = {
      chatId: '1',
      content: 'tekst\\n\\ntekst',
      authorTimestamp: new Date().toISOString(),
      authorId: 'EE60001019906',
      authorFirstName: 'name',
      authorRole: AUTHOR_ROLES.BACKOFFICE_USER,
    };

    expect(ChatService.sendMessage).toHaveBeenCalledWith(expectedRequestBody);
  });

  it('should send new message when send message button is clicked', () => {
    ChatService.sendMessage = jest.fn(() => Promise.resolve({ id: '123', status: CHAT_STATUS.ENDED, created: '', updated: '', ended: '', lastMessage: '' }));
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2000-01-01T00:00:00.000Z');

    render(
      <Provider store={testStore}>
        <ChatKeypad />
      </Provider>,
    );

    const textArea = screen.getByRole('textbox');

    fireEvent.change(textArea, { target: { value: 'New Message' } });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', code: 'Enter', charCode: 13 });

    const expectedRequestBody: MessageModel = {
      chatId: '1',
      content: 'New Message',
      authorTimestamp: new Date().toISOString(),
      authorId: 'EE60001019906',
      authorFirstName: 'name',
      authorRole: AUTHOR_ROLES.BACKOFFICE_USER,
    };

    expect(ChatService.sendMessage).toHaveBeenCalledWith(expectedRequestBody);
  });
});
