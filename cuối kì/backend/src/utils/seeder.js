const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const Teacher = require('../models/Teacher');
const TeacherPosition = require('../models/TeacherPosition');

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/school.users.json'), 'utf-8')
);
const teachers = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/school.teachers.json'), 'utf-8')
);
const positions = JSON.parse(
  fs.readFileSync(path.join(__dirname, ../data/school.teacherpositions.json'), 'utf-8')
);

const cleanData = (items) => {
  return items.map((item) => {
    const newItem = { ...item };
    if (newItem._id && newItem._id.$oid) newItem._id = newItem._id.$oid;
    if (newItem.userId && newItem.userId.$oid) newItem.userId = newItem.userId.$oid;
    if (newItem.createdAt && newItem.createdAt.$date) newItem.createdAt = newItem.createdAt.$date;
    if (newItem.updatedAt && newItem.updatedAt.$date) newItem.updatedAt = newItem.updatedAt.$date;
    
    if (Array.isArray(newItem.teacherPositionsId)) {
      newItem.teacherPositionsId = newItem.teacherPositionsId.map((pos) => pos.$oid || pos);
    }
    return newItem;
  });
};

const importData = async () => {
    try {
        await User.deleteMany();
        await Teacher.deleteMany();
        await TeacherPosition.deleteMany();

        await User.insertMany(cleanData(users));
        await TeacherPosition.insertMany(cleanData(positions));
        await Teacher.insertMany(cleanData(teachers));

        console.log(' Đã nạp thành công dữ liệu từ JSON vào MongoDB!');
    } catch (error) {
        console.error(' Lỗi nạp dữ liệu:', error.message);
    }
};

module.exports = importData;