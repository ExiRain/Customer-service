import React from 'react';
import Linkify from 'linkify-react';

const Linkifier = (props: { message: string | undefined }): JSX.Element => {
  const { message = '' } = props;

  const regex = new RegExp('(https:\\/\\/[a-zõäöüA-ZÕÄÖÜ0-9.\\-\\/_]+)(?:\\s|$)');
  return (
    <div>
      <Linkify
        options={{
          attributes: { target: '_blank' },
          defaultProtocol: 'https',
          validate: {
            url: (value: string) => regex.test(value),
            email: false,
          },
        }}
      >
        {message.replaceAll(/\\n/g, '\n')}
      </Linkify>
    </div>
  );
};

export default Linkifier;
