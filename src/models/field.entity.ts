import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 文章分区
@Entity({ name: "field" })
export class FieldEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键id' })
  id: number;

  @Column({ comment: "领域", nullable: false })
  field: string;

  @Column({ comment: '顺序号,顺序号越小的分区排序在前', default: 0 })
  order?: number;

  @Column({ comment: '是否可见', default: 0 })
  isVisiable?: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt?: Date;

  @UpdateDateColumn({ comment: '最后修改时间' })
  updatedAt?: Date;

  @Column({ comment: '是否删除', default: 0 })
  isDeleted?: boolean;
}