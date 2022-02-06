import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 文章分区
@Entity({ name: "field" })
export class FieldEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键id' })
  id: number;

  @Column({ comment: "领域", nullable: false })
  field: string;
  
  @CreateDateColumn({ comment: '创建时间' })
  createdAt?: Date;

  @UpdateDateColumn({ comment: '最后修改时间' })
  updatedAt?: Date;

  @Column({ comment: '是否删除', default: 0 })
  isDeleted?: boolean;
}