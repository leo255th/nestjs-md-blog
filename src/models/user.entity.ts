import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: "user" })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键，用户的id' })
  id: number;

  @Column({ nullable: false, comment: '用户名' })
  userName: string;

  @Column({ nullable: false, comment: '密码' })
  passWord: string;

  @Column({ default: '', comment: '主页留言' })
  message?: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt?: Date;

  @UpdateDateColumn({ comment: '最后修改时间' })
  updatedAt?: Date;

  @Column({ comment: '是否删除', default: 0 })
  isDeleted?: boolean;

}
