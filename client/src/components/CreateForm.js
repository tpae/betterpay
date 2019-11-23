import React from 'react';
import { Text, Form, Textarea, Button, Loader } from 'rimble-ui';
import { RadioGroup, Dialog } from 'evergreen-ui';
import useForm from 'react-hook-form';

const messages = {
  title: {
    required: 'Title is required',
  },
  amount: {
    pattern: 'This is not a valid amount.'
  }
};

const ErrorMessage = ({ errors, name }) => {
  if (!errors[name]) return null;
  return <Text color="red">{messages[name][errors[name].type]}</Text>;
};

export default function CreateForm(props) {
  const { onSubmit, show, loading, onClose, role, onRoleChange } = props;
  const { register, handleSubmit, errors } = useForm();

  return (
    <Dialog
      isShown={show}
      onCloseComplete={onClose}
      hasHeader={false}
      hasFooter={false}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <RadioGroup
          size={16}
          label="Your Role"
          value={role}
          onChange={onRoleChange}
          options={[{ label: 'Buyer - I am buying good/service', value: 'buyer' }, { label: 'Seller - I am selling good/service', value: 'seller' }]}
          name="role"
        />
        <Form.Field label="Title" width={1}>
          <Form.Input
            type="text"
            required
            width={1}
            name="title"
            ref={register({ required: true })}
            placeholder="Title"
          />
          <ErrorMessage errors={errors} name="title" />
        </Form.Field>
        <Form.Field label="Description" width={1}>
          <Textarea
            rows={4}
            width={1}
            name="description"
            ref={register({ required: false })}
            placeholder="Description"
          />
          <ErrorMessage errors={errors} name="description" />
        </Form.Field>
        <Form.Field label="Price (in ETH)" width={1}>
          <Form.Input
            type="number"
            step="any"
            required
            width={1}
            name="price"
            ref={register({ pattern: /\d+/ })}
            placeholder="e.g. 0.85"
          />
          <ErrorMessage errors={errors} name="price" />
        </Form.Field>
        <Button disabled={loading} type="submit" width={1}>
          {!loading ? "Confirm" : (
            <Loader color="white" />
          )}
        </Button>
      </Form>
    </Dialog>
  );
}