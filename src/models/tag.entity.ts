import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


// 文章的标签
@Entity({ name: "tag" })
export class TagEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键，标签的id' })
  id: number;

  @Column({ nullable: true, comment: '文章的id', type: 'bigint' })
  articleId: number;

  @Column({ comment: "标签内容", nullable: false })
  tag: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt?: Date;

  @UpdateDateColumn({ comment: '最后修改时间' })
  updatedAt?: Date;

  @Column({ comment: '是否删除', default: 0 })
  isDeleted?: boolean;

}
