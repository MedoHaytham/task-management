/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const User = require('./models/users');
const Project = require('./models/projects');
const Task = require('./models/tasks');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const seed = async () => {
  await mongoose.connect(DB);
  console.log('Connected to MongoDB...');

  // 1) Wipe everything so the script is safely re-runnable
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  console.log('Old data cleared.');

  // 2) Create users
  // Using User.create() (not insertMany) so the pre-save hook
  // actually hashes the passwords — insertMany skips middleware.
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'admin',
  });

  const member1 = await User.create({
    name: 'Sara Member',
    email: 'member1@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'member',
  });

  const member2 = await User.create({
    name: 'Omar Member',
    email: 'member2@test.com',
    password: 'password123',
    passwordConfirm: 'password123',
    role: 'member',
  });

  console.log('Users created.');

  // 3) Create a project — admin is the owner, both members are added
  const project = await Project.create({
    name: 'Website Redesign',
    description: 'Revamp the marketing website with the new brand identity',
    owner: admin._id,
    members: [member1._id, member2._id],
  });

  console.log('Project created.');

  // 4) Create tasks spread across all three statuses,
  // assigned to different project members
  await Task.create([
    {
      title: 'Set up project repository',
      description: 'Initialize the repo and CI pipeline',
      status: 'Done',
      priority: 'High',
      project: project._id,
      creator: admin._id,
      assignee: member1._id,
    },
    {
      title: 'Design homepage mockup',
      description: 'Create the Figma mockup for the new homepage',
      status: 'In Progress',
      priority: 'High',
      project: project._id,
      creator: admin._id,
      assignee: member2._id,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints in Postman',
      status: 'To Do',
      priority: 'Medium',
      project: project._id,
      creator: member1._id,
      assignee: member1._id,
    },
    {
      title: 'Fix mobile navbar bug',
      description: 'Navbar overlaps content on small screens',
      status: 'To Do',
      priority: 'Low',
      project: project._id,
      creator: admin._id,
      // unassigned on purpose — tests the "no assignee" case
    },
  ]);

  console.log('Tasks created.');

  // 5) Print ready-to-use credentials
  console.log('\n========== SEED COMPLETE ==========');
  console.log('Admin login:');
  console.log('  email:    admin@test.com');
  console.log('  password: password123');
  console.log('\nMember logins:');
  console.log('  email:    member1@test.com  | password: password123');
  console.log('  email:    member2@test.com  | password: password123');
  console.log('\nProject ID:', project._id.toString());
  console.log('====================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
